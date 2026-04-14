import React, { createContext, useContext, useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { auth, db, storage } from "../firebase";
import { 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

interface PremiumRequest {
  id?: string;
  username: string;
  status: "pending" | "approved" | "rejected";
  timestamp: number;
  expiryDate?: number; // timestamp
}

interface Material {
  id: string;
  category: "Listening" | "Reading" | "Writing" | "Speaking" | "Books" | "Vocabulary" | "Mock Tests";
  subCategory?: "Listening" | "Reading" | "Writing" | "Speaking";
  name: string;
  mockTestId?: string; // Group ID for mock test components
  type: string; // mimeType
  content: string; // This will now store the download URL from Storage
  timestamp: number;
  isPremium?: boolean;
}

interface UserResult {
  id: string;
  firstName: string;
  lastName: string;
  telegramUsername: string;
  materialId: string;
  materialName: string;
  component: "Listening" | "Reading" | "Writing" | "Speaking";
  score?: string;
  bandScore?: string;
  writingTask1?: string;
  writingTask2?: string;
  content?: string;
  aiFeedback?: string;
  timestamp: number;
  userId: string;
  userName: string;
}

interface Transcription {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  audioUrl?: string;
}

interface UserProfile {
  uid: string;
  email: string;
  premiumStatus: "none" | "pending" | "approved";
  expiryDate: number | null;
  role: "user" | "admin" | "teacher";
  isBlocked?: boolean;
}

interface GlobalSettings {
  mockTestAccessEnabled: boolean;
}

interface CheatAlert {
  id?: string;
  userId: string;
  userName: string;
  timestamp: number;
  type: "fullscreen_exit";
}

interface GeminiContextType {
  user: User | null;
  loading: boolean;
  isGeminiEnabled: boolean;
  isPremiumPlus: boolean;
  premiumStatus: "none" | "pending" | "approved";
  role: "user" | "admin" | "teacher";
  expiryDate: number | null;
  isBlocked: boolean;
  isMockTestEnabled: boolean;
  toggleGemini: (enabled: boolean) => void;
  sendPremiumRequest: (username: string) => void;
  approveRequest: (requestId: string, username: string, expiryDate: number) => void;
  rejectRequest: (requestId: string, username: string) => void;
  allRequests: PremiumRequest[];
  materials: Material[];
  addMaterial: (material: Omit<Material, "id" | "timestamp">, file?: File) => Promise<void>;
  deleteMaterial: (id: string) => void;
  results: UserResult[];
  submitResult: (result: Omit<UserResult, "id" | "timestamp" | "userId" | "userName">) => void;
  transcriptions: Transcription[];
  submitTranscription: (transcription: Omit<Transcription, "id" | "timestamp" | "userId">) => Promise<void>;
  generateAIResponse: (prompt: string, systemInstruction?: string) => Promise<string>;
  generateAIResponseStream: (prompt: string, systemInstruction?: string) => Promise<AsyncIterable<any>>;
  analyzeSpeaking: (audioBase64: string, mimeType: string) => Promise<string>;
  transcribeAudio: (audioBase64: string, mimeType: string) => Promise<string>;
  setMockTestAccess: (enabled: boolean) => Promise<void>;
  sendCheatAlert: (userName: string) => Promise<void>;
  blockUser: (userId: string, blocked: boolean) => Promise<void>;
  allUsers: UserProfile[];
  cheatAlerts: CheatAlert[];
  gradeMockTest: (rawScore: number) => number;
  grantPremiumStatus: (userId: string, role: "admin" | "teacher") => Promise<void>;
}

const GeminiContext = createContext<GeminiContextType | undefined>(undefined);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function GeminiProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeminiEnabled, setIsGeminiEnabled] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<"none" | "pending" | "approved">("none");
  const [role, setRole] = useState<"user" | "admin" | "teacher">("user");
  const [expiryDate, setExpiryDate] = useState<number | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMockTestEnabled, setIsMockTestEnabled] = useState(false);
  const [allRequests, setAllRequests] = useState<PremiumRequest[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [results, setResults] = useState<UserResult[]>([]);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [cheatAlerts, setCheatAlerts] = useState<CheatAlert[]>([]);

  const isPremiumPlus = premiumStatus === "approved";

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }

      if (currentUser) {
        // Session Persistence Check (1 month)
        const lastActive = localStorage.getItem(`lastActive_${currentUser.uid}`);
        const now = Date.now();
        const oneMonth = 30 * 24 * 60 * 60 * 1000;

        if (lastActive && now - parseInt(lastActive) > oneMonth) {
          await auth.signOut();
          localStorage.removeItem(`lastActive_${currentUser.uid}`);
          setUser(null);
          setLoading(false);
          return;
        }
        
        localStorage.setItem(`lastActive_${currentUser.uid}`, now.toString());

        // Fetch user profile
        const userDocRef = doc(db, "users", currentUser.uid);
        
        // Real-time listener for user profile to handle blocking and role changes
        unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setPremiumStatus(userData.premiumStatus || "none");
            setRole(userData.role || "user");
            setExpiryDate(userData.expiryDate || null);
            setIsBlocked(userData.isBlocked || false);
            setIsGeminiEnabled(userData.premiumStatus === "approved");
          } else {
            // Default for new users
            setPremiumStatus("none");
            setRole("user");
            setIsBlocked(false);
            setIsGeminiEnabled(false);
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          setLoading(false);
        });

        // Check for default admin
        const isDefaultAdmin = currentUser.email === "shohruxmuminov201@gmail.com";
        if (isDefaultAdmin) {
          try {
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              premiumStatus: "approved",
              role: "admin",
              displayName: currentUser.displayName || "Admin",
              createdAt: new Date().toISOString()
            }, { merge: true });
          } catch (error) {
            console.error("Error setting default admin:", error);
          }
        }
      } else {
        setUser(null);
        setPremiumStatus("none");
        setRole("user");
        setExpiryDate(null);
        setIsBlocked(false);
        setIsGeminiEnabled(false);
        setMaterials([]);
        setAllRequests([]);
        setResults([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  // Global settings listener
  useEffect(() => {
    const unsubscribeSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        setIsMockTestEnabled(docSnap.data().mockTestAccessEnabled);
      }
    });
    return () => unsubscribeSettings();
  }, []);

  // Real-time listeners
  useEffect(() => {
    if (!user) return;

    const qMaterials = query(collection(db, "materials"), orderBy("timestamp", "desc"));
    const unsubscribeMaterials = onSnapshot(qMaterials, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return { 
          id: doc.id, 
          ...d,
          // Handle both number and Firestore Timestamp
          timestamp: d.timestamp?.toMillis?.() || d.timestamp || Date.now()
        } as Material;
      });
      setMaterials(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "materials");
    });

    let unsubscribeRequests = () => {};
    let unsubscribeResults = () => {};
    let unsubscribeTranscriptions = () => {};
    let unsubscribeUsers = () => {};
    let unsubscribeAlerts = () => {};

    if (role === "admin" || role === "teacher") {
      const qRequests = query(collection(db, "requests"), orderBy("timestamp", "desc"));
      unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PremiumRequest));
        setAllRequests(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, "requests");
      });

      const qResults = query(collection(db, "results"), orderBy("timestamp", "desc"));
      unsubscribeResults = onSnapshot(qResults, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserResult));
        setResults(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, "results");
      });

      const qTranscriptions = query(collection(db, "transcriptions"), orderBy("timestamp", "desc"));
      unsubscribeTranscriptions = onSnapshot(qTranscriptions, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transcription));
        setTranscriptions(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, "transcriptions");
      });

      const qUsers = query(collection(db, "users"));
      unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
        setAllUsers(data);
      });

      const qAlerts = query(collection(db, "alerts"), orderBy("timestamp", "desc"));
      unsubscribeAlerts = onSnapshot(qAlerts, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheatAlert));
        setCheatAlerts(data);
      });
    }

    return () => {
      unsubscribeMaterials();
      unsubscribeRequests();
      unsubscribeResults();
      unsubscribeTranscriptions();
      unsubscribeUsers();
      unsubscribeAlerts();
    };
  }, [user, role]);

  // Check for expiry
  useEffect(() => {
    if (isPremiumPlus && expiryDate && Date.now() > expiryDate) {
      if (user) {
        updateDoc(doc(db, "users", user.uid), {
          premiumStatus: "none",
          expiryDate: null
        });
      }
      setPremiumStatus("none");
      setExpiryDate(null);
      setIsGeminiEnabled(false);
    }
  }, [isPremiumPlus, expiryDate, user]);

  const toggleGemini = (enabled: boolean) => {
    if (enabled && !isPremiumPlus) {
      return;
    }
    setIsGeminiEnabled(enabled);
  };

  const sendPremiumRequest = async (username: string) => {
    if (!user) return;

    await addDoc(collection(db, "requests"), {
      username,
      status: "pending",
      timestamp: Date.now(),
      uid: user.uid
    });

    await updateDoc(doc(db, "users", user.uid), {
      premiumStatus: "pending"
    });
    
    setPremiumStatus("pending");
  };

  const approveRequest = async (requestId: string, username: string, expiry: number) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: "approved",
        expiryDate: expiry
      });

      const reqDoc = await getDoc(doc(db, "requests", requestId));
      const uid = reqDoc.data()?.uid;
      
      if (uid) {
        await updateDoc(doc(db, "users", uid), {
          premiumStatus: "approved",
          expiryDate: expiry
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `requests/${requestId}`);
    }
  };

  const rejectRequest = async (requestId: string, username: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: "rejected"
      });

      const reqDoc = await getDoc(doc(db, "requests", requestId));
      const uid = reqDoc.data()?.uid;
      
      if (uid) {
        await updateDoc(doc(db, "users", uid), {
          premiumStatus: "none",
          expiryDate: null
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `requests/${requestId}`);
    }
  };

  const addMaterial = async (material: Omit<Material, "id" | "timestamp">, file?: File) => {
    let contentUrl = material.content;

    try {
      if (file) {
        try {
          // Try Storage first
          const storageRef = ref(storage, `materials/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          contentUrl = await getDownloadURL(snapshot.ref);
          console.log("Storage upload successful:", contentUrl);
        } catch (storageError: any) {
          console.warn("Storage upload failed, attempting Firestore fallback:", storageError.message || storageError);
          // Fallback for small files (< 1MB - Firestore limit)
          if (file.size < 1000000) {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              // For text/html files, read as text to save space if possible, 
              // but base64 is safer for all types in the content field
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error("Failed to read file for fallback"));
              reader.readAsDataURL(file);
            });
            contentUrl = base64;
            console.log("Firestore fallback successful (Base64)");
          } else {
            console.error("File too large for Firestore fallback (limit ~1MB)");
            throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max size for fallback is 1MB. Please ensure Firebase Storage is working for larger files.`);
          }
        }
      }

      await addDoc(collection(db, "materials"), {
        ...material,
        content: contentUrl,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "materials");
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      await deleteDoc(doc(db, "materials", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `materials/${id}`);
    }
  };

  const gradeWritingTask = async (taskType: 1 | 2, essay: string) => {
    if (!isGeminiEnabled) return null;

    const prompt = `
      As an expert IELTS examiner, grade the following Writing Task ${taskType} essay based on the official IELTS band descriptors:
      - Task Achievement/Response (How well the candidate answered the question)
      - Coherence and Cohesion (Organization and flow of ideas)
      - Lexical Resource (Vocabulary range and accuracy)
      - Grammatical Range and Accuracy (Grammar complexity and precision)

      Essay:
      ${essay}

      Provide a detailed report including:
      1. Band score for each of the 4 criteria (0-9)
      2. Overall Band Score
      3. Detailed feedback for improvement based on official band descriptors
      4. Corrected version of key sentences if necessary

      Format the output in clear Markdown.
    `;

    try {
      const response = await generateAIResponse(prompt);
      return response;
    } catch (error) {
      console.error("AI Grading Error:", error);
      return "AI Grading failed. Please review manually.";
    }
  };

  const calculateBandScore = (rawScore: number): string => {
    if (rawScore >= 39) return "9.0";
    if (rawScore >= 37) return "8.5";
    if (rawScore >= 35) return "8.0";
    if (rawScore >= 33) return "7.5";
    if (rawScore >= 30) return "7.0";
    if (rawScore >= 27) return "6.5";
    if (rawScore >= 23) return "6.0";
    if (rawScore >= 19) return "5.5";
    if (rawScore >= 15) return "5.0";
    if (rawScore >= 13) return "4.5";
    if (rawScore >= 10) return "4.0";
    if (rawScore >= 8) return "3.5";
    if (rawScore >= 6) return "3.0";
    if (rawScore >= 4) return "2.5";
    if (rawScore >= 2) return "2.0";
    if (rawScore >= 1) return "1.5";
    return "0.0";
  };

  const submitResult = async (result: Omit<UserResult, "id" | "timestamp" | "userId" | "userName">) => {
    try {
      let aiFeedback = "";
      let bandScore = "";

      // Automated Band Score for Listening/Reading
      if ((result.component === "Listening" || result.component === "Reading") && result.score) {
        const rawScoreMatch = result.score.match(/^(\d+)/);
        if (rawScoreMatch) {
          const rawScore = parseInt(rawScoreMatch[1]);
          bandScore = calculateBandScore(rawScore);
        }
      }
      
      // If writing task is present, get AI feedback
      if (result.component === "Writing" && result.content) {
        // Assuming taskType 2 for generic writing tasks if not specified
        aiFeedback = await gradeWritingTask(2, result.content) || "AI Grading failed.";
      }

      await addDoc(collection(db, "results"), {
        ...result,
        bandScore,
        aiFeedback,
        userId: user?.uid,
        userName: user?.displayName || user?.email || "Anonymous",
        timestamp: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "results");
    }
  };

  const submitTranscription = async (transcription: Omit<Transcription, "id" | "timestamp" | "userId">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "transcriptions"), {
        ...transcription,
        userId: user.uid,
        timestamp: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "transcriptions");
    }
  };

  const generateAIResponse = async (prompt: string, systemInstruction?: string) => {
    if (!isGeminiEnabled) {
      throw new Error("AI is not enabled. Please activate Premium Plus.");
    }

    try {
      // Check for image generation request
      const lowerPrompt = prompt.toLowerCase();
      const isImageRequest = lowerPrompt.includes("generate image") || 
                             lowerPrompt.includes("draw") || 
                             lowerPrompt.includes("create a picture") || 
                             lowerPrompt.includes("show me a picture of") ||
                             lowerPrompt.includes("rasm generate") ||
                             lowerPrompt.includes("rasm chiz");

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: systemInstruction || "You are a helpful and versatile AI assistant. You can help with any topic, including IELTS, general knowledge, coding, creative writing, and more. If the user asks for an image, you can describe it and provide a markdown image link using https://pollinations.ai/p/[prompt-description]?width=1024&height=1024&seed=[random-number]. Ensure the prompt description is URL-encoded.",
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      });

      let text = response.text || "I'm sorry, I couldn't generate a response.";

      if (isImageRequest) {
        const seed = Math.floor(Math.random() * 1000000);
        const encodedPrompt = encodeURIComponent(prompt.replace(/generate image|draw|create a picture|show me a picture of|rasm generate|rasm chiz/gi, "").trim());
        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}`;
        text += `\n\n![Generated Image](${imageUrl})`;
      }

      return text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  };

  const generateAIResponseStream = async (prompt: string, systemInstruction?: string) => {
    if (!isGeminiEnabled) {
      throw new Error("AI is not enabled. Please activate Premium Plus.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction || "You are a helpful and versatile AI assistant. You can help with any topic, including IELTS, general knowledge, coding, creative writing, and more.",
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });
  };

  const analyzeSpeaking = async (audioBase64: string, mimeType: string) => {
    if (!isGeminiEnabled) {
      throw new Error("AI is not enabled. Please activate Premium Plus.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType
          }
        },
        {
          text: "Please analyze this IELTS speaking practice recording. Evaluate it based on the four official IELTS criteria: 1. Fluency and Coherence, 2. Lexical Resource, 3. Grammatical Range and Accuracy, 4. Pronunciation. For each criterion, provide a brief evaluation and specific examples from the recording. Also, provide an Estimated Band Score and 3-5 Actionable Tips for improvement. Format your response using Markdown with these exact headings: '## Fluency and Coherence', '## Lexical Resource', '## Grammatical Range and Accuracy', '## Pronunciation', '## Estimated Band Score', and '## Actionable Tips'."
        }
      ],
      config: {
        systemInstruction: "You are an expert IELTS Speaking Examiner. Provide detailed, professional, and constructive feedback based on official IELTS criteria.",
        temperature: 0.4,
      },
    });

    return response.text || "I'm sorry, I couldn't analyze the recording.";
  };

  const transcribeAudio = async (audioBase64: string, mimeType: string) => {
    if (!isGeminiEnabled) {
      throw new Error("AI is not enabled. Please activate Premium Plus.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType
          }
        },
        {
          text: "Please transcribe the following audio exactly as spoken. Do not add any commentary or analysis. Just the plain text transcription."
        }
      ],
      config: {
        systemInstruction: "You are a highly accurate transcription assistant. Your goal is to provide a verbatim transcription of the provided audio.",
        temperature: 0.1,
      },
    });

    return response.text || "I'm sorry, I couldn't transcribe the recording.";
  };

  const setMockTestAccess = async (enabled: boolean) => {
    if (role !== "admin" && role !== "teacher") return;
    try {
      await setDoc(doc(db, "settings", "global"), {
        mockTestAccessEnabled: enabled
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "settings/global");
    }
  };

  const sendCheatAlert = async (userName: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "alerts"), {
        userId: user.uid,
        userName,
        timestamp: Date.now(),
        type: "fullscreen_exit"
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "alerts");
    }
  };

  const blockUser = async (userId: string, blocked: boolean) => {
    if (role !== "admin" && role !== "teacher") return;
    try {
      await updateDoc(doc(db, "users", userId), {
        isBlocked: blocked
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  };

  const gradeMockTest = (rawScore: number): number => {
    if (rawScore >= 39) return 9;
    if (rawScore >= 37) return 8.5;
    if (rawScore >= 35) return 8;
    if (rawScore >= 33) return 7.5;
    if (rawScore >= 30) return 7;
    if (rawScore >= 27) return 6.5;
    if (rawScore >= 23) return 6;
    if (rawScore >= 19) return 5.5;
    if (rawScore >= 15) return 5;
    if (rawScore >= 13) return 4.5;
    if (rawScore >= 10) return 4;
    if (rawScore >= 8) return 3.5;
    if (rawScore >= 6) return 3;
    if (rawScore >= 4) return 2.5;
    if (rawScore >= 2) return 2;
    if (rawScore >= 1) return 1.5;
    return 0;
  };

  const grantPremiumStatus = async (userId: string, role: "admin" | "teacher") => {
    try {
      if (!user) return;
      await setDoc(doc(db, "users", userId), {
        uid: userId,
        email: user.email,
        premiumStatus: "approved",
        expiryDate: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
        role: role,
        displayName: user.displayName || (role === "admin" ? "Admin" : "Teacher"),
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  };

  return (
    <GeminiContext.Provider value={{ 
      user,
      loading,
      isGeminiEnabled, 
      isPremiumPlus, 
      premiumStatus,
      role,
      expiryDate,
      isBlocked,
      isMockTestEnabled,
      toggleGemini, 
      sendPremiumRequest,
      approveRequest,
      rejectRequest,
      allRequests,
      materials,
      addMaterial,
      deleteMaterial,
      results,
      submitResult,
      transcriptions,
      submitTranscription,
      generateAIResponse,
      generateAIResponseStream,
      analyzeSpeaking,
      transcribeAudio,
      setMockTestAccess,
      sendCheatAlert,
      blockUser,
      allUsers,
      cheatAlerts,
      gradeMockTest,
      grantPremiumStatus
    }}>
      {children}
    </GeminiContext.Provider>
  );
}

export function useGemini() {
  const context = useContext(GeminiContext);
  if (context === undefined) {
    throw new Error("useGemini must be used within a GeminiProvider");
  }
  return context;
}

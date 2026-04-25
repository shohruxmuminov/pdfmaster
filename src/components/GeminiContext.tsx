import React, { createContext, useContext, useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { db, storage, auth } from "../firebase";
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
  serverTimestamp,
  increment,
  runTransaction
} from "firebase/firestore";

interface Material {
  id: string;
  category: "Listening" | "Reading" | "Writing" | "Speaking" | "Books" | "Vocabulary" | "Mock Tests";
  subCategory?: "Listening" | "Reading" | "Writing" | "Speaking";
  examType?: "IELTS" | "Multilevel";
  name: string;
  mockTestId?: string;
  type: string;
  content: string;
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
  expiryDate: number | null;
  role: "user" | "admin" | "teacher";
  isBlocked?: boolean;
  displayName?: string;
  premiumStatus?: string;
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

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest: boolean;
}

interface GeminiContextType {
  user: AppUser | null;
  loading: boolean;
  isGeminiEnabled: boolean;
  isPremium: boolean;
  role: "user" | "admin" | "teacher";
  expiryDate: number | null;
  isBlocked: boolean;
  isMockTestEnabled: boolean;
  premiumStatus?: string;
  toggleGemini: (enabled: boolean) => void;
  updateUserPremium: (userId: string, isPremium: boolean, expiryDays: number) => Promise<void>;
  materials: Material[];
  addMaterial: (material: Omit<Material, "id" | "timestamp">, file?: File, contentString?: string) => Promise<void>;
  deleteMaterial: (id: string) => void;
  clearMaterialsExceptSpeaking: () => Promise<void>;
  results: UserResult[];
  submitResult: (result: Omit<UserResult, "id" | "timestamp" | "userId" | "userName">) => void;
  transcriptions: Transcription[];
  submitTranscription: (transcription: Omit<Transcription, "id" | "timestamp" | "userId">) => Promise<void>;
  generateAIResponse: (prompt: string, systemInstruction?: string) => Promise<string>;
  generateAIResponseStream: (prompt: string, systemInstruction?: string) => Promise<any>;
  analyzeSpeaking: (audioBase64: string, mimeType: string) => Promise<string>;
  transcribeAudio: (audioBase64: string, mimeType: string) => Promise<string>;
  setMockTestAccess: (enabled: boolean) => Promise<void>;
  sendCheatAlert: (userName: string) => Promise<void>;
  blockUser: (userId: string, blocked: boolean) => Promise<void>;
  allUsers: UserProfile[];
  cheatAlerts: CheatAlert[];
  gradeMockTest: (rawScore: number) => number;
  grantPremiumStatus: (userId: string, role: "admin" | "teacher") => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
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
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeminiEnabled, setIsGeminiEnabled] = useState(true);
  const [role, setRole] = useState<"user" | "admin" | "teacher">("user");
  const [expiryDate, setExpiryDate] = useState<number | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMockTestEnabled, setIsMockTestEnabled] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [results, setResults] = useState<UserResult[]>([]);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [cheatAlerts, setCheatAlerts] = useState<CheatAlert[]>([]);

  const isPremium = expiryDate ? Date.now() < expiryDate : false;

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;
    let isGuestMode = localStorage.getItem("guest_mode") === "true";

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        localStorage.removeItem("guest_mode");
        isGuestMode = false;
        
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          isGuest: false
        });

        const userDocRef = doc(db, "users", currentUser.uid);
        
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || "User",
          lastActive: Date.now()
        }, { merge: true });

        unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setRole(userData.role || "user");
            setExpiryDate(userData.expiryDate || null);
            setIsBlocked(userData.isBlocked || false);
            setIsGeminiEnabled(true);
          } else {
            setRole("user");
            setIsBlocked(false);
            setIsGeminiEnabled(true);
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          setLoading(false);
        });

      } else if (isGuestMode) {
        setUser({
          uid: "guest-" + Math.random().toString(36).substr(2, 9),
          email: "student@guest.local",
          displayName: "Student",
          photoURL: null,
          isGuest: true
        });
        setRole("user");
        setIsBlocked(false);
        setIsGeminiEnabled(true);
        setExpiryDate(null);
        setLoading(false);
      } else {
        setUser(null);
        setRole("user");
        setExpiryDate(null);
        setIsBlocked(false);
        setIsGeminiEnabled(false);
        setMaterials([]);
        setResults([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const loginAsGuest = () => {
    localStorage.setItem("guest_mode", "true");
    window.location.href = "/";
  };

  const logout = async () => {
    if (localStorage.getItem("guest_mode") === "true") {
      localStorage.removeItem("guest_mode");
      window.location.href = "/auth";
    } else {
      await auth.signOut();
      window.location.href = "/auth";
    }
  };

  // Global settings listener
  useEffect(() => {
    if (!user) {
      setIsMockTestEnabled(false);
      return;
    }
    
    const unsubscribeSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        setIsMockTestEnabled(docSnap.data().mockTestAccessEnabled);
      }
    }, (error) => {
      console.warn("Settings listener error (expected if not logged in):", error.message);
    });
    return () => unsubscribeSettings();
  }, [user]);

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

    let unsubscribeResults = () => {};
    let unsubscribeTranscriptions = () => {};
    let unsubscribeUsers = () => {};
    let unsubscribeAlerts = () => {};

    if (role === "admin" || role === "teacher") {
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
      }, (error) => {
        console.error("Users listener error:", error);
      });

      const qAlerts = query(collection(db, "alerts"), orderBy("timestamp", "desc"));
      unsubscribeAlerts = onSnapshot(qAlerts, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheatAlert));
        setCheatAlerts(data);
      }, (error) => {
        console.error("Alerts listener error:", error);
      });
    }

    return () => {
      unsubscribeMaterials();
      unsubscribeResults();
      unsubscribeTranscriptions();
      unsubscribeUsers();
      unsubscribeAlerts();
    };
  }, [user, role]);

  // Check for expiry
  useEffect(() => {
    if (isPremium && expiryDate && Date.now() > expiryDate) {
      if (user && !user.isGuest) {
        updateDoc(doc(db, "users", user.uid), {
          expiryDate: null
        });
      }
      setExpiryDate(null);
      setIsGeminiEnabled(false);
    }
  }, [isPremium, expiryDate, user]);

  const toggleGemini = (enabled: boolean) => {
    if (enabled && !isPremium) {
      return;
    }
    setIsGeminiEnabled(enabled);
  };
  
  const updateUserPremium = async (userId: string, isPremium: boolean, expiryDays: number) => {
    if (role !== "admin") return;
    
    const expiryDate = isPremium ? Date.now() + (expiryDays * 24 * 60 * 60 * 1000) : null;
    
    await updateDoc(doc(db, "users", userId), {
      expiryDate: expiryDate
    });
  };

  const addMaterial = async (material: Omit<Material, "id" | "timestamp">, file?: File, contentString?: string) => {
    let contentUrl = material.content;

    try {
      if (file || contentString) {
        let size = 0;
        if (file) {
          size = file.size;
        } else if (contentString) {
          size = contentString.length;
        }

        const resolvedType = material.type || (file ? file.type : "text/html") || "text/html";
        const isHtml = resolvedType.includes("html");

        try {
          const fileName = file ? file.name : `manual_${Date.now()}.html`;
          const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const storageRef = ref(storage, `materials/${Date.now()}_${safeName}`);
          
          let uploadPromise;
          if (file) {
            uploadPromise = uploadBytes(storageRef, file, { contentType: resolvedType });
          } else if (contentString) {
            uploadPromise = uploadBytes(storageRef, new Blob([contentString], { type: resolvedType }), { contentType: resolvedType });
          }
          
          if (uploadPromise) {
            const snapshot = await Promise.race([
              uploadPromise,
              new Promise((_, reject) => setTimeout(() => reject(new Error("Storage upload timed out")), 10000))
            ]);
            contentUrl = await getDownloadURL((snapshot as any).ref);
          }
        } catch (storageError: any) {
          const MAX_FIRESTORE_SIZE = 950000;
          if (size >= MAX_FIRESTORE_SIZE) {
            throw new Error(`Upload failed: File is too large.`);
          }

          if (isHtml) {
             if (contentString && !contentString.startsWith("data:")) {
               contentUrl = contentString;
             } else if (file) {
               const rawHtml = await new Promise<string>((resolve, reject) => {
                 const reader = new FileReader();
                 reader.onload = () => resolve(reader.result as string);
                 reader.onerror = () => reject(new Error("Failed to read HTML file"));
                 reader.readAsText(file);
               });
               contentUrl = rawHtml;
             }
          } else {
            if (contentString && contentString.startsWith("data:")) {
              contentUrl = contentString;
            } else if (file) {
              const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error("Failed to read file for fallback"));
                reader.readAsDataURL(file);
              });
              contentUrl = base64;
            }
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

  const clearMaterialsExceptSpeaking = async () => {
    try {
      const nonSpeakingMaterials = materials.filter(m => m.category !== "Speaking");
      const promises = nonSpeakingMaterials.map(m => deleteDoc(doc(db, "materials", m.id)));
      await Promise.all(promises);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "materials/batch");
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

      if ((result.component === "Listening" || result.component === "Reading") && result.score) {
        const rawScoreMatch = result.score.match(/^(\\d+)/);
        if (rawScoreMatch) {
          const rawScore = parseInt(rawScoreMatch[1]);
          bandScore = calculateBandScore(rawScore);
        }
      }
      
      if (result.component === "Writing" && result.content) {
        aiFeedback = await gradeWritingTask(2, result.content) || "AI Grading failed.";
      }

      await addDoc(collection(db, "results"), {
        ...result,
        bandScore,
        aiFeedback,
        userId: user?.uid || "mock-user",
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

  const genAI = React.useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" }), []);

  const generateAIResponse = async (prompt: string, systemInstruction?: string) => {
    if (!isGeminiEnabled) {
      throw new Error("AI is not enabled. Please activate Premium Plus.");
    }

    const lowerPrompt = prompt.toLowerCase();
    const isImageRequest = lowerPrompt.includes("generate image") || 
                           lowerPrompt.includes("draw") || 
                           lowerPrompt.includes("create a picture") || 
                           lowerPrompt.includes("show me a picture of") ||
                           lowerPrompt.includes("rasm generate") ||
                           lowerPrompt.includes("rasm chiz");

    try {
      const config: any = {};
      if (systemInstruction) config.systemInstruction = systemInstruction;
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config
      });
      let text = response.text || "I'm sorry, I couldn't generate a response.";

      if (isImageRequest) {
        const seed = Math.floor(Math.random() * 1000000);
        const encodedPrompt = encodeURIComponent(prompt.replace(/generate image|draw|create a picture|show me a picture of|rasm generate|rasm chiz/gi, "").trim());
        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}`;
        text += `\n\n![Generated Image](${imageUrl})`;
      }

      return text;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  };

  const generateAIResponseStream = async (prompt: string, systemInstruction?: string) => {
    if (!isGeminiEnabled) {
      throw new Error("AI is not enabled. Please activate Premium Plus.");
    }

    try {
      const config: any = {};
      if (systemInstruction) config.systemInstruction = systemInstruction;
      const response = await genAI.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config
      });
      
      async function* geminiStream() {
        for await (const chunk of response) {
          const text = chunk.text;
          yield { text };
        }
      }
      
      return geminiStream();
    } catch (error: any) {
      console.error("Gemini Stream Error:", error);
      throw error;
    }
  };

  const analyzeSpeaking = async (audioBase64: string, mimeType: string) => {
    if (!isGeminiEnabled) {
      throw new Error("AI is not enabled. Please activate Premium Plus.");
    }

    try {
      let dataStr = audioBase64;
      if (dataStr.startsWith('data:')) {
        const parts = dataStr.split(',');
        dataStr = parts[1];
      }
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: dataStr, mimeType: mimeType } },
            { text: "Analyze this IELTS Speaking attempt." }
          ]
        },
        config: {
          systemInstruction: "You are an expert IELTS Speaking examiner. Analyze the provided audio and give feedback based on: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation. Provide a band score estimate and clear tips for improvement."
        }
      });
      return response.text || "I encountered an error while analyzing your speaking.";
    } catch (error) {
      console.error("Gemini Speaking Analysis Error:", error);
      return "I encountered an error while analyzing your speaking. Please try again or check your internet connection.";
    }
  };

  const transcribeAudio = async (audioBase64: string, mimeType: string) => {
    if (!isGeminiEnabled) {
      throw new Error("AI is not enabled. Please activate Premium Plus.");
    }

    try {
      let dataStr = audioBase64;
      if (dataStr.startsWith('data:')) {
        const parts = dataStr.split(',');
        dataStr = parts[1];
      }
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: dataStr, mimeType: mimeType } },
            { text: "Transcribe this audio exactly as spoken. Do not add any commentary." }
          ]
        }
      });
      return response.text || "Transcription failed.";
    } catch (error) {
      console.error("Gemini Transcription Error:", error);
      return "Transcription failed.";
    }
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
        email: user.email || "no-email",
        expiryDate: Date.now() + (365 * 24 * 60 * 60 * 1000), 
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
      isPremium, 
      role,
      expiryDate,
      isBlocked,
      isMockTestEnabled,
      toggleGemini, 
      updateUserPremium,
      materials,
      addMaterial,
      deleteMaterial,
      clearMaterialsExceptSpeaking,
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
      grantPremiumStatus,
      loginAsGuest,
      logout
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

import React, { createContext, useContext, useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { auth, db } from "../firebase";
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
  getDocFromServer
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
  category: "Listening" | "Reading" | "Writing" | "Speaking" | "Books" | "Vocabulary";
  subCategory?: "Listening" | "Reading" | "Writing" | "Speaking";
  name: string;
  type: string; // mimeType
  content: string; // base64 or raw string for HTML
  timestamp: number;
}

interface UserResult {
  id: string;
  firstName: string;
  lastName: string;
  telegramUsername: string;
  materialId: string;
  materialName: string;
  score: string;
  timestamp: number;
}

interface GeminiContextType {
  user: User | null;
  loading: boolean;
  isGeminiEnabled: boolean;
  isPremiumPlus: boolean;
  premiumStatus: "none" | "pending" | "approved";
  role: "user" | "admin";
  expiryDate: number | null;
  toggleGemini: (enabled: boolean) => void;
  sendPremiumRequest: (username: string) => void;
  approveRequest: (requestId: string, username: string, expiryDate: number) => void;
  rejectRequest: (requestId: string, username: string) => void;
  allRequests: PremiumRequest[];
  materials: Material[];
  addMaterial: (material: Omit<Material, "id" | "timestamp">) => void;
  deleteMaterial: (id: string) => void;
  results: UserResult[];
  submitResult: (result: Omit<UserResult, "id" | "timestamp">) => void;
  generateAIResponse: (prompt: string, systemInstruction?: string) => Promise<string>;
  generateAIResponseStream: (prompt: string, systemInstruction?: string) => Promise<AsyncIterable<any>>;
  analyzeSpeaking: (audioBase64: string, mimeType: string) => Promise<string>;
}

const GeminiContext = createContext<GeminiContextType | undefined>(undefined);

export function GeminiProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeminiEnabled, setIsGeminiEnabled] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<"none" | "pending" | "approved">("none");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [expiryDate, setExpiryDate] = useState<number | null>(null);
  const [allRequests, setAllRequests] = useState<PremiumRequest[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [results, setResults] = useState<UserResult[]>([]);

  const isPremiumPlus = premiumStatus === "approved";

  // Test Firestore connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const isDefaultAdmin = currentUser.email === "shohruxmuminov201@gmail.com";
          setPremiumStatus(userData.premiumStatus || (isDefaultAdmin ? "approved" : "none"));
          setRole(userData.role || (isDefaultAdmin ? "admin" : "user"));
          setExpiryDate(userData.expiryDate || null);
          setIsGeminiEnabled(userData.premiumStatus === "approved" || isDefaultAdmin);
        } else {
          // If document doesn't exist yet, check if it's the default admin
          const isDefaultAdmin = currentUser.email === "shohruxmuminov201@gmail.com";
          if (isDefaultAdmin) {
            setPremiumStatus("approved");
            setRole("admin");
            setIsGeminiEnabled(true);
          }
        }
      } else {
        setPremiumStatus("none");
        setRole("user");
        setExpiryDate(null);
        setIsGeminiEnabled(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listeners
  useEffect(() => {
    if (!user) return;

    const qMaterials = query(collection(db, "materials"), orderBy("timestamp", "desc"));
    const unsubscribeMaterials = onSnapshot(qMaterials, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material));
      setMaterials(data);
    }, (error) => {
      console.error("Materials error:", error);
    });

    let unsubscribeRequests = () => {};
    let unsubscribeResults = () => {};

    if (role === "admin") {
      const qRequests = query(collection(db, "requests"), orderBy("timestamp", "desc"));
      unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PremiumRequest));
        setAllRequests(data);
      }, (error) => {
        console.error("Requests error:", error);
      });

      const qResults = query(collection(db, "results"), orderBy("timestamp", "desc"));
      unsubscribeResults = onSnapshot(qResults, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserResult));
        setResults(data);
      }, (error) => {
        console.error("Results error:", error);
      });
    }

    return () => {
      unsubscribeMaterials();
      unsubscribeRequests();
      unsubscribeResults();
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
    await updateDoc(doc(db, "requests", requestId), {
      status: "approved",
      expiryDate: expiry
    });

    // Find the user ID for this request (in a real app, you'd store uid in the request)
    // For this demo, we'll assume the request has a uid field
    const reqDoc = await getDoc(doc(db, "requests", requestId));
    const uid = reqDoc.data()?.uid;
    
    if (uid) {
      await updateDoc(doc(db, "users", uid), {
        premiumStatus: "approved",
        expiryDate: expiry
      });
    }
  };

  const rejectRequest = async (requestId: string, username: string) => {
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
  };

  const addMaterial = async (material: Omit<Material, "id" | "timestamp">) => {
    await addDoc(collection(db, "materials"), {
      ...material,
      timestamp: Date.now()
    });
  };

  const deleteMaterial = async (id: string) => {
    await deleteDoc(doc(db, "materials", id));
  };

  const submitResult = async (result: Omit<UserResult, "id" | "timestamp">) => {
    await addDoc(collection(db, "results"), {
      ...result,
      timestamp: Date.now()
    });
  };

  const generateAIResponse = async (prompt: string, systemInstruction?: string) => {
    if (!isGeminiEnabled) {
      throw new Error("AI is not enabled. Please activate Premium Plus.");
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: systemInstruction || "You are a helpful IELTS tutor. Provide clear, accurate, and encouraging advice for IELTS preparation.",
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      });

      return response.text || "I'm sorry, I couldn't generate a response.";
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
        systemInstruction: systemInstruction || "You are a helpful IELTS tutor. Provide clear, accurate, and encouraging advice for IELTS preparation.",
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
      model: "gemini-2.0-flash",
      contents: [
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType
          }
        },
        {
          text: "Please analyze this IELTS speaking practice recording. Evaluate the pronunciation, fluency, and grammar. Provide a estimated band score and actionable tips for improvement. Format your response using Markdown with clear headings."
        }
      ],
      config: {
        systemInstruction: "You are an expert IELTS Speaking Examiner. Provide detailed, professional, and constructive feedback based on official IELTS criteria.",
        temperature: 0.4,
      },
    });

    return response.text || "I'm sorry, I couldn't analyze the recording.";
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
      generateAIResponse,
      generateAIResponseStream,
      analyzeSpeaking
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

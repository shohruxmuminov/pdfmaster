import React, { useState, useRef, useEffect, useMemo } from "react";
import { useGemini } from "@/src/components/GeminiContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Shield, Check, X, Clock, User, Lock, AlertCircle, Plus, Trash2, FileText, Upload, Eye, List, LogIn, Loader2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const { 
    user, 
    role, 
    allRequests, 
    approveRequest, 
    rejectRequest, 
    materials, 
    addMaterial, 
    deleteMaterial, 
    results, 
    transcriptions, 
    premiumStatus, 
    grantPremiumStatus,
    isMockTestEnabled,
    setMockTestAccess
  } = useGemini();
  const [adminCode, setAdminCode] = useState("");
  const [isCodeAuthenticated, setIsCodeAuthenticated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"requests" | "materials" | "results" | "transcriptions">("requests");
  const navigate = useNavigate();
  
  useEffect(() => {
    if (role === "admin") {
      setIsCodeAuthenticated(true);
    }
  }, [role]);

  // Material Form State
  const [materialForm, setMaterialForm] = useState({ 
    name: "", 
    category: "Listening" as any,
    subCategory: "Listening" as any,
    mockTestId: ""
  });

  // Calculate next mock test number
  const nextMockNumber = useMemo(() => {
    const mockTests = materials.filter(m => m.category === "Mock Tests");
    const ids = mockTests.map(m => {
      const match = m.mockTestId?.match(/Mock Test (\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return maxId + 1;
  }, [materials]);

  useEffect(() => {
    if (materialForm.category === "Mock Tests") {
      setMaterialForm(prev => ({
        ...prev,
        name: `Mock Test ${nextMockNumber}`,
        mockTestId: `Mock Test ${nextMockNumber}`
      }));
    }
  }, [materialForm.category, nextMockNumber]);

  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [mockTestFiles, setMockTestFiles] = useState<{
    Listening: File | null;
    Reading: File | null;
    Writing: File | null;
    Speaking: File | null;
  }>({
    Listening: null,
    Reading: null,
    Writing: null,
    Speaking: null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Approval State
  const [expiryDays, setExpiryDays] = useState("30");

  const handleLogin = async () => {
    if (adminCode === "2424") {
      setError("");
      if (user) {
        try {
          await grantPremiumStatus(user.uid, "admin");
          setIsCodeAuthenticated(true);
        } catch (err) {
          setError("Failed to grant admin status. Please try again.");
        }
      } else {
        setError("You must be logged in to access the admin panel.");
      }
    } else {
      setError("Invalid admin code.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileType(file.type);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string);
    };

    if (file.type.includes("html") || file.type.includes("text")) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError("");
    
    try {
      if (materialForm.category === "Mock Tests") {
        const sections = ["Listening", "Reading", "Writing", "Speaking"] as const;
        const selectedSections = sections.filter(s => mockTestFiles[s]);
        
        if (selectedSections.length === 0) {
          setError("Please select at least one file for the mock test.");
          setIsUploading(false);
          return;
        }

        const mockName = materialForm.name || `Mock Test ${nextMockNumber}`;
        const uploadPromises = selectedSections.map(async (section) => {
          const file = mockTestFiles[section];
          if (file) {
            return addMaterial({
              name: `${mockName} - ${section}`,
              category: "Mock Tests",
              subCategory: section,
              mockTestId: mockName,
              type: file.type,
              content: ""
            }, file);
          }
        });
        await Promise.all(uploadPromises);
      } else {
        if (!selectedFile && !fileContent) {
          setError("Please select a file or paste HTML content first.");
          setIsUploading(false);
          return;
        }
        const isAutoName = materialForm.category === "Books" || materialForm.category === "Vocabulary";
        
        await addMaterial({
          name: isAutoName ? (fileName || "Manual Material") : materialForm.name,
          category: materialForm.category,
          subCategory: (materialForm.category === "Books") ? materialForm.subCategory : undefined,
          mockTestId: undefined,
          type: fileType || "text/html",
          content: ""
        }, selectedFile || undefined, fileContent || undefined);
      }

      setMaterialForm({ name: "", category: "Listening", subCategory: "Listening", mockTestId: "" });
      setFileContent(null);
      setSelectedFile(null);
      setFileName("");
      setMockTestFiles({ Listening: null, Reading: null, Writing: null, Speaking: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setError("");
      setSuccess("Material uploaded successfully!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      console.error("Error adding material:", err);
      let message = "Failed to add material.";
      try {
        const parsed = JSON.parse(err.message);
        message = `Error: ${parsed.error} (${parsed.operationType} on ${parsed.path})`;
      } catch {
        message = err.message || "Failed to add material. Please check file size and permissions.";
      }
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center bg-slate-900 text-white p-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription className="text-slate-400">Please log in to access the admin panel.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Button onClick={() => navigate("/auth")} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold">
              <LogIn className="h-5 w-5 mr-2" /> Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isCodeAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center bg-slate-900 text-white p-8">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/40">
                <Shield className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
              <CardDescription className="text-slate-400">Enter the secure code to manage IELTS platform.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Admin Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button 
                onClick={handleLogin}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20"
              >
                Login to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-3 border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-900 text-white py-4 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Global Settings</CardTitle>
                <CardDescription className="text-slate-400 text-xs">Control platform-wide features</CardDescription>
              </div>
              <Shield className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isMockTestEnabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isMockTestEnabled ? <Eye className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Mock Test Access</h3>
                    <p className="text-xs text-slate-500">Enable or disable mock test access for all students</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setMockTestAccess(!isMockTestEnabled)}
                  className={`rounded-xl px-6 font-bold ${isMockTestEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                >
                  {isMockTestEnabled ? "Disable Access" : "Enable Access"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage requests, materials, and track user results.</p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Button 
              variant={activeTab === "requests" ? "default" : "ghost"} 
              onClick={() => setActiveTab("requests")}
              className="rounded-xl px-6"
            >
              Requests
            </Button>
            <Button 
              variant={activeTab === "materials" ? "default" : "ghost"} 
              onClick={() => setActiveTab("materials")}
              className="rounded-xl px-6"
            >
              Materials
            </Button>
            <Button 
              variant={activeTab === "results" ? "default" : "ghost"} 
              onClick={() => setActiveTab("results")}
              className="rounded-xl px-6"
            >
              Results
            </Button>
            <Button 
              variant={activeTab === "transcriptions" ? "default" : "ghost"} 
              onClick={() => setActiveTab("transcriptions")}
              className="rounded-xl px-6"
            >
              Transcriptions
            </Button>
          </div>
        </div>

        <div className="grid gap-8">
          <AnimatePresence mode="wait">
            {activeTab === "requests" && (
              <motion.div 
                key="requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Premium+ Requests</h2>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-500">Default Expiry (Days):</label>
                    <input 
                      type="number" 
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(e.target.value)}
                      className="w-20 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                    />
                  </div>
                </div>

                {allRequests.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                    <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No pending requests</h3>
                    <p className="text-slate-500">New requests will appear here as they come in.</p>
                  </div>
                ) : (
                  allRequests.sort((a, b) => b.timestamp - a.timestamp).map((request) => (
                    <div
                      key={request.id || request.username + request.timestamp}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                          <User className="h-7 w-7 text-slate-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{request.username}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="h-3 w-3" />
                            {new Date(request.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          request.status === "pending" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                          request.status === "approved" ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" :
                          "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        }`}>
                          {request.status}
                          {request.status === "approved" && request.expiryDate && (
                            <span className="ml-2 opacity-70">
                              (Expires: {new Date(request.expiryDate).toLocaleDateString()})
                            </span>
                          )}
                        </div>

                        {request.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button 
                              onClick={() => {
                                if (request.id) {
                                  const expiry = Date.now() + (parseInt(expiryDays) * 24 * 60 * 60 * 1000);
                                  approveRequest(request.id, request.username, expiry);
                                }
                              }}
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4"
                            >
                              <Check className="h-4 w-4 mr-2" /> Approve
                            </Button>
                            <Button 
                              onClick={() => request.id && rejectRequest(request.id, request.username)}
                              size="sm" 
                              variant="outline" 
                              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 rounded-xl px-4"
                            >
                              <X className="h-4 w-4 mr-2" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "materials" && (
              <motion.div 
                key="materials"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 overflow-hidden">
                  <CardHeader className="bg-slate-50 dark:bg-slate-900/50 p-8 border-b border-slate-200 dark:border-slate-800">
                    <CardTitle className="text-2xl">Upload New Material</CardTitle>
                    <CardDescription>Add HTML or other files to IELTS sections.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                      <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2">Import from Wisdom2</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">Quickly import materials from your previous website (wisdom2.netlify.app).</p>
                      
                      <div className="flex flex-wrap gap-3 mb-4">
                        {(["Reading", "Listening", "Writing", "Speaking", "Mock Test"] as const).map((cat) => (
                          <Button
                            key={cat}
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                setError("");
                                setSuccess(`Importing ${cat} materials...`);
                                const { collection, addDoc } = await import("firebase/firestore");
                                const { db } = await import("../firebase");
                                
                                let materialsToImport: {title: string, url: string, isPremium: boolean}[] = [];

                                if (cat === "Reading") {
                                  materialsToImport = [
                                    {title:"IELTS with Jurabek - Reading Test 1", url:"/reading/IELTSwithJurabek Reading.html", isPremium: false},
                                    {title:"IELTS with Jurabek - Reading Test 2", url:"/reading/IELTSwithJurabek.html", isPremium: false},
                                    {title:"CDI Full Reading", url:"/reading/CDI Full reading.html", isPremium: false},
                                    {title:"CDI Reading", url:"/reading/CDI Reading.html", isPremium: false},
                                    {title:"Premium Full Reading 1", url:"/reading/premiumreading/IELTSwithJurabek FULL Reading 1.html", isPremium: true},
                                    {title:"Premium Full Reading 2", url:"/reading/premiumreading/IELTSwithJurabek Reading full 2.html", isPremium: true},
                                    {title:"Premium Full Reading 3", url:"/reading/premiumreading/IELTSwithJurabek Full reading 3.html", isPremium: true},
                                    {title:"Premium Full Reading 4", url:"/reading/premiumreading/IELTSwithJurabek Full reading 4.html", isPremium: true},
                                    {title:"Premium Full Reading 5", url:"/reading/premiumreading/IELTSwithJurabek full reading 5.html", isPremium: true},
                                    {title:"Premium Full Reading 6", url:"/reading/premiumreading/IELTSwithJurabek FULL Reading 6.html", isPremium: true},
                                    {title:"Premium Full Reading 7", url:"/reading/premiumreading/IELTSwithJurabek Reading full 7.html", isPremium: true},
                                    {title:"Premium Full Reading 8", url:"/reading/premiumreading/Full reading 8.html", isPremium: true},
                                    {title:"Premium Full Reading 9 (3 Passages)", url:"/reading/premiumreading/Full Reading 12.html", isPremium: true},
                                    {title:"Premium Full Reading 10", url:"/reading/premiumreading/Full reading 10.html", isPremium: true},
                                    {title:"Premium Full Reading 11", url:"/reading/premiumreading/IELTSwithJurabek FULL Reading 11.html", isPremium: true},
                                    {title:"Premium Full Reading 12", url:"/reading/premiumreading/Full Reading 12.html", isPremium: true}
                                  ];
                                } else if (cat === "Listening") {
                                  materialsToImport = [
                                    {title:"IELTS with Jurabek - Listening Test 1", url:"/listening/test1.html", isPremium: false},
                                    {title:"IELTS with Jurabek - Listening Test 2", url:"/listening/test2.html", isPremium: false},
                                    {title:"Premium Listening 1", url:"/listening/premium/test1.html", isPremium: true},
                                    {title:"Premium Listening 2", url:"/listening/premium/test2.html", isPremium: true}
                                  ];
                                } else if (cat === "Writing") {
                                  materialsToImport = [
                                    {title:"IELTS with Jurabek - Writing Task 1", url:"/writing/task1.html", isPremium: false},
                                    {title:"IELTS with Jurabek - Writing Task 2", url:"/writing/task2.html", isPremium: false},
                                    {title:"Premium Writing 1", url:"/writing/premium/task1.html", isPremium: true}
                                  ];
                                } else if (cat === "Speaking") {
                                  materialsToImport = [
                                    {title:"IELTS with Jurabek - Speaking Part 1", url:"/speaking/part1.html", isPremium: false},
                                    {title:"IELTS with Jurabek - Speaking Part 2", url:"/speaking/part2.html", isPremium: false},
                                    {title:"Premium Speaking 1", url:"/speaking/premium/part1.html", isPremium: true}
                                  ];
                                } else if (cat === "Mock Test") {
                                  const mockSuites = [
                                    { id: "Mock Test 1", listening: "/listening/test1.html", reading: "/reading/IELTSwithJurabek Reading.html", writing: "/writing/task1.html", speaking: "/speaking/part1.html" },
                                    { id: "Mock Test 2", listening: "/listening/test2.html", reading: "/reading/IELTSwithJurabek.html", writing: "/writing/task2.html", speaking: "/speaking/part2.html" },
                                    { id: "Mock Test 3", listening: "/listening/premium/test1.html", reading: "/reading/premiumreading/IELTSwithJurabek FULL Reading 1.html", writing: "/writing/premium/task1.html", speaking: "/speaking/premium/part1.html" }
                                  ];
                                  
                                  for (const suite of mockSuites) {
                                    const sections = [
                                      { sub: "Listening", url: suite.listening },
                                      { sub: "Reading", url: suite.reading },
                                      { sub: "Writing", url: suite.writing },
                                      { sub: "Speaking", url: suite.speaking }
                                    ] as const;
                                    
                                    for (const section of sections) {
                                      await addDoc(collection(db, "materials"), {
                                        name: `${suite.id} - ${section.sub}`,
                                        category: "Mock Tests",
                                        subCategory: section.sub,
                                        mockTestId: suite.id,
                                        type: "text/html",
                                        content: "https://wisdom2.netlify.app" + section.url.replace(/ /g, "%20"),
                                        timestamp: Date.now(),
                                        isPremium: true
                                      });
                                    }
                                  }
                                  setSuccess(`Successfully imported ${mockSuites.length} Mock Test suites!`);
                                  return;
                                }

                                for (const mat of materialsToImport) {
                                  await addDoc(collection(db, "materials"), {
                                    name: mat.title,
                                    category: cat,
                                    subCategory: cat,
                                    type: "text/html",
                                    content: "https://wisdom2.netlify.app" + mat.url.replace(/ /g, "%20"),
                                    timestamp: Date.now(),
                                    isPremium: mat.isPremium
                                  });
                                }
                                setSuccess(`Successfully imported ${materialsToImport.length} ${cat} materials!`);
                              } catch (err: any) {
                                setError("Import failed: " + err.message);
                              }
                            }}
                            className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            Import {cat}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <div className="mb-6 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="font-medium">{error}</p>
                      </div>
                    )}
                    {success && (
                      <div className="mb-6 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                        <Check className="h-5 w-5 shrink-0" />
                        <p className="font-medium">{success}</p>
                      </div>
                    )}
                    <form onSubmit={handleAddMaterial} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select 
                          value={materialForm.category}
                          onChange={(e) => setMaterialForm({...materialForm, category: e.target.value as any})}
                          className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          <option value="Listening">Listening</option>
                          <option value="Reading">Reading</option>
                          <option value="Writing">Writing</option>
                          <option value="Speaking">Speaking</option>
                          <option value="Books">My Premium Books</option>
                          <option value="Vocabulary">Premium Vocabulary</option>
                          <option value="Mock Tests">Full Mock Tests</option>
                        </select>
                      </div>

                      {materialForm.category === "Books" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Sub-category</label>
                          <select 
                            value={materialForm.subCategory}
                            onChange={(e) => setMaterialForm({...materialForm, subCategory: e.target.value as any})}
                            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 transition-all"
                          >
                            <option value="Listening">Listening</option>
                            <option value="Reading">Reading</option>
                            <option value="Writing">Writing</option>
                            <option value="Speaking">Speaking</option>
                          </select>
                        </div>
                      )}

                      {materialForm.category === "Mock Tests" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Mock Test Name</label>
                          <input 
                            required
                            type="text" 
                            value={materialForm.name}
                            onChange={(e) => setMaterialForm({...materialForm, name: e.target.value, mockTestId: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="e.g. Mock Test 1"
                          />
                        </div>
                      )}

                      {materialForm.category !== "Books" && materialForm.category !== "Vocabulary" && materialForm.category !== "Mock Tests" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Material Name</label>
                          <input 
                            required
                            type="text" 
                            value={materialForm.name}
                            onChange={(e) => setMaterialForm({...materialForm, name: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="e.g. Cambridge 18 Test 1"
                          />
                        </div>
                      )}

                      {materialForm.category === "Mock Tests" ? (
                        <div className="md:col-span-2 space-y-4">
                          <label className="text-sm font-medium">Mock Test Files (Select for each section)</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(["Listening", "Reading", "Writing", "Speaking"] as const).map((section) => (
                              <div key={section} className="space-y-2">
                                <p className="text-xs font-bold text-slate-500 uppercase">{section}</p>
                                <div 
                                  onClick={() => {
                                    const input = document.createElement("input");
                                    input.type = "file";
                                    input.onchange = (e: any) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setMockTestFiles(prev => ({ ...prev, [section]: file }));
                                      }
                                    };
                                    input.click();
                                  }}
                                  className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                >
                                  <Upload className="h-4 w-4 text-slate-400" />
                                  <span className="text-sm truncate">
                                    {mockTestFiles[section] ? mockTestFiles[section]?.name : `Select ${section} file`}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="md:col-span-2 space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">File (HTML preferred for auto-rendering)</label>
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                            >
                              <Upload className="h-8 w-8 text-slate-400 mb-2" />
                              <p className="text-sm text-slate-500">{selectedFile ? `Selected: ${fileName}` : "Click to select file"}</p>
                              <input 
                                ref={fileInputRef}
                                type="file" 
                                className="hidden" 
                                onChange={handleFileChange}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Or Paste HTML Content Directly</label>
                            <textarea 
                              value={fileContent || ""}
                              onChange={(e) => setFileContent(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[200px]"
                              placeholder="Paste HTML content here..."
                            />
                          </div>
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <Button 
                          type="submit" 
                          disabled={isUploading || (materialForm.category === "Mock Tests" ? !Object.values(mockTestFiles).some(f => f !== null) : (!selectedFile && !fileContent))} 
                          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Plus className="h-5 w-5 mr-2" /> 
                              {materialForm.category === "Mock Tests" ? "Upload Mock Test Suite" : "Add Material"}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Existing Materials</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {materials.map((material) => (
                      <div key={material.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{material.name}</p>
                            <p className="text-xs text-slate-500">
                              {material.category} 
                              {material.subCategory && ` (${material.subCategory})`} • {new Date(material.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => deleteMaterial(material.id)}
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "results" && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">User Results</h2>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-4 font-bold text-sm text-slate-600 dark:text-slate-400">User</th>
                        <th className="p-4 font-bold text-sm text-slate-600 dark:text-slate-400">Username</th>
                        <th className="p-4 font-bold text-sm text-slate-600 dark:text-slate-400">Telegram</th>
                        <th className="p-4 font-bold text-sm text-slate-600 dark:text-slate-400">Material</th>
                        <th className="p-4 font-bold text-sm text-slate-600 dark:text-slate-400">Component</th>
                        <th className="p-4 font-bold text-sm text-slate-600 dark:text-slate-400">Score</th>
                        <th className="p-4 font-bold text-sm text-slate-600 dark:text-slate-400">Band</th>
                        <th className="p-4 font-bold text-sm text-slate-600 dark:text-slate-400">Content/Feedback</th>
                        <th className="p-4 font-bold text-sm text-slate-600 dark:text-slate-400">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.length > 0 ? (
                        results.map((result) => (
                          <tr key={result.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="p-4 font-medium">{result.firstName} {result.lastName}</td>
                            <td className="p-4 text-xs text-slate-500">{result.userName}</td>
                            <td className="p-4 text-blue-600 dark:text-blue-400">{result.telegramUsername}</td>
                            <td className="p-4 text-slate-600 dark:text-slate-400">{result.materialName}</td>
                            <td className="p-4 text-slate-600 dark:text-slate-400">{result.component}</td>
                            <td className="p-4 font-bold text-blue-600">{result.score}</td>
                            <td className="p-4 font-black text-green-600">{result.bandScore || "N/A"}</td>
                            <td className="p-4">
                              {(result.content || result.aiFeedback) ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-blue-600 h-8 px-2 text-[10px] font-bold uppercase tracking-widest"
                                  onClick={() => {
                                    const text = `STUDENT: ${result.firstName} ${result.lastName}\nUSERNAME: ${result.userName}\nTELEGRAM: ${result.telegramUsername}\nTEST: ${result.materialName}\nCOMPONENT: ${result.component}\nDATE: ${new Date(result.timestamp).toLocaleString()}\n\nCONTENT:\n${result.content || 'N/A'}\n\nAI EVALUATION:\n${result.aiFeedback || 'N/A'}`;
                                    const blob = new Blob([text], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `${result.firstName}_${result.lastName}_${result.component}_Evaluation.txt`;
                                    link.click();
                                    URL.revokeObjectURL(url);
                                  }}
                                >
                                  Download
                                </Button>
                              ) : "N/A"}
                            </td>
                            <td className="p-4 text-xs text-slate-500">{new Date(result.timestamp).toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-slate-500">No results recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
            {activeTab === "transcriptions" && (
              <motion.div 
                key="transcriptions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">User Audio Transcriptions</h2>
                <div className="grid gap-4">
                  {transcriptions.length > 0 ? (
                    transcriptions.map((t) => (
                      <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{t.userName}</p>
                              <p className="text-xs text-slate-500">{new Date(t.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Speaking Practice
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-slate-700 dark:text-slate-300">
                          "{t.text}"
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">No transcriptions yet</h3>
                      <p className="text-slate-500">User transcriptions will appear here.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

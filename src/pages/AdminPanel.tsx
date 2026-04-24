import React, { useState, useRef, useEffect, useMemo } from "react";
import { useGemini } from "@/src/components/GeminiContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Shield, Check, X, Clock, User, Lock, AlertCircle, Plus, Trash2, FileText, Upload, Eye, List, LogIn, Loader2, Download, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { INITIAL_MATERIALS } from "@/src/constants/initialMaterials";

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
    clearMaterialsExceptSpeaking,
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

  // Approval State
  const [expiryDays, setExpiryDays] = useState("30");

  // Material Form State
  const [materialForm, setMaterialForm] = useState({ 
    name: "", 
    category: "Listening" as any,
    subCategory: "Listening" as any,
    mockTestId: "",
    isPremium: false
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

    const isHtmlExt = file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm');
    const computedType = isHtmlExt ? "text/html" : (file.type || "application/octet-stream");

    setSelectedFile(file);
    setFileType(computedType);
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string);
    };

    if (computedType.includes("html") || computedType.includes("text")) {
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
        for (const section of selectedSections) {
          const file = mockTestFiles[section];
          if (file) {
            const isHtmlExt = file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm');
            await addMaterial({
              name: `${mockName} - ${section}`,
              category: "Mock Tests",
              subCategory: section,
              mockTestId: mockName,
              type: isHtmlExt ? "text/html" : (file.type || "text/html"),
              isPremium: materialForm.isPremium,
              content: ""
            }, file);
          }
        }
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
          ...(materialForm.category === "Books" ? { subCategory: materialForm.subCategory } : {}),
          type: fileType || "text/html",
          isPremium: materialForm.isPremium,
          content: ""
        }, selectedFile || undefined, fileContent || undefined);
      }

      setMaterialForm({ name: "", category: "Listening", subCategory: "Listening", mockTestId: "", isPremium: false });
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
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Upload New Material</h2>
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                      <Star className={`h-4 w-4 ${materialForm.isPremium ? 'text-amber-500' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Premium Mode:</span>
                      <button 
                        onClick={() => setMaterialForm(prev => ({ ...prev, isPremium: !prev.isPremium }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${materialForm.isPremium ? 'bg-amber-500' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${materialForm.isPremium ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleAddMaterial} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                        <select 
                          value={materialForm.category}
                          onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value as any })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Listening">Listening</option>
                          <option value="Reading">Reading</option>
                          <option value="Writing">Writing</option>
                          <option value="Speaking">Speaking</option>
                          <option value="Books">Books</option>
                          <option value="Vocabulary">Vocabulary</option>
                          <option value="Mock Tests">Mock Tests</option>
                        </select>
                      </div>

                      {materialForm.category === "Books" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sub-Category</label>
                          <select 
                            value={materialForm.subCategory}
                            onChange={(e) => setMaterialForm({ ...materialForm, subCategory: e.target.value as any })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Listening">Listening Books</option>
                            <option value="Reading">Reading Books</option>
                            <option value="Writing">Writing Books</option>
                            <option value="Speaking">Speaking Books</option>
                            <option value="Full Course">Full Course Books</option>
                          </select>
                        </div>
                      )}

                      {materialForm.category !== "Books" && materialForm.category !== "Vocabulary" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Test Name</label>
                          <input 
                            type="text" 
                            placeholder={materialForm.category === "Mock Tests" ? `Mock Test ${nextMockNumber}` : "e.g. Cambridge 18 Test 1"}
                            value={materialForm.name}
                            onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    {materialForm.category === "Mock Tests" ? (
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Mock Test Sections</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {["Listening", "Reading", "Writing", "Speaking"].map((section) => (
                            <div key={section} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                              <span className="font-bold text-sm">{section}</span>
                              <input 
                                type="file"
                                onChange={(e) => setMockTestFiles(prev => ({ ...prev, [section]: e.target.files?.[0] || null }))}
                                className="text-xs text-slate-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">File Content (HTML or Text)</label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center cursor-pointer hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-900/50"
                        >
                          <Upload className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{fileName || "Click to upload file"}</p>
                          <p className="text-xs text-slate-500 mt-2">HTML, PDF, or TXT files supported</p>
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden" 
                        />
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="submit" 
                        disabled={isUploading}
                        className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20"
                      >
                        {isUploading ? (
                          <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Uploading...</>
                        ) : (
                          <><Plus className="h-5 w-5 mr-2" /> {materialForm.isPremium ? 'Add Premium Material' : 'Add Free Material'}</>
                        )}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setMaterialForm({ name: "", category: "Listening", subCategory: "Listening", mockTestId: "", isPremium: false });
                          setFileContent(null);
                          setSelectedFile(null);
                          setFileName("");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-800 font-bold"
                      >
                        Clear
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Migration Tools</h2>
                  <p className="text-sm text-slate-500">Manual uploads are enabled. Use these tools to manage the platform materials.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                          <Trash2 className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">Database Cleanup</h3>
                          <p className="text-xs text-slate-500 text-red-600 font-medium italic">Remove all data except "Speaking"</p>
                        </div>
                      </div>
                      <Button 
                        onClick={async () => {
                          if (confirm("Are you sure? This will permanently delete all tests except Speaking.")) {
                            try {
                              await clearMaterialsExceptSpeaking();
                              setSuccess("Successfully cleared all materials except Speaking!");
                            } catch (err: any) {
                              setError("Cleanup failed: " + err.message);
                            }
                          }
                        }}
                        className="rounded-xl px-6 font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50"
                        variant="outline"
                      >
                        Clear Non-Speaking
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">Load New Materials</h3>
                          <p className="text-xs text-slate-500">Wipe and load the 4 new Listening Free tests</p>
                        </div>
                      </div>
                      <Button 
                        onClick={async () => {
                          if (confirm("Wipe other data and load the provided HTML sets? This will set them as FREE tests for all users.")) {
                            try {
                              setIsUploading(true);
                              await clearMaterialsExceptSpeaking();
                              for (const mat of INITIAL_MATERIALS) {
                                const response = await fetch(mat.path);
                                if (!response.ok) throw new Error(`Failed to fetch ${mat.name}`);
                                const html = await response.text();
                                
                                await addMaterial({
                                  name: mat.name,
                                  category: mat.category as any,
                                  subCategory: mat.category as any,
                                  type: "text/html",
                                  isPremium: false,
                                  content: ""
                                }, undefined, html);
                              }
                              setSuccess("Successfully loaded FREE materials!");
                            } catch (err: any) {
                              setError("Batch load failed: " + err.message);
                            } finally {
                              setIsUploading(false);
                            }
                          }
                        }}
                        className="rounded-xl px-6 font-bold bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Run Migration
                      </Button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                    <Check className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{success}</p>
                  </div>
                )}

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
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 dark:text-white">{material.name}</p>
                              {material.isPremium ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <Star className="h-2 w-2" /> Premium
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                                  Free
                                </span>
                              )}
                            </div>
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

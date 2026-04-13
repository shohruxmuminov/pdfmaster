import React, { useState, useEffect } from "react";
import { useGemini } from "@/src/components/GeminiContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { 
  Users, 
  Shield, 
  ShieldAlert, 
  Trophy, 
  Settings, 
  Bell, 
  Ban, 
  CheckCircle2, 
  Clock,
  Search,
  LayoutGrid,
  FileText,
  ChevronRight,
  UserCheck,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TeacherPanel() {
  const { 
    user,
    role, 
    allUsers, 
    cheatAlerts, 
    results, 
    transcriptions,
    isMockTestEnabled, 
    setMockTestAccess, 
    blockUser,
    grantPremiumStatus
  } = useGemini();
  const [accessCode, setAccessCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "alerts" | "results" | "transcriptions">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (role === "teacher" || role === "admin") {
      setIsAuthorized(true);
    }
  }, [role]);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === "1994") {
      if (user) {
        try {
          await grantPremiumStatus(user.uid, "teacher");
          setIsAuthorized(true);
        } catch (err) {
          alert("Failed to grant teacher status. Please try again.");
        }
      } else {
        alert("You must be logged in to access the teacher panel.");
      }
    } else {
      alert("Invalid Access Code");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <div className="bg-blue-600 p-10 text-white text-center">
              <Shield className="h-16 w-16 mx-auto mb-6" />
              <h1 className="text-3xl font-black tracking-tight">Teacher Access</h1>
              <p className="text-blue-100 mt-2 font-medium">Enter your secure code to continue</p>
            </div>
            <CardContent className="p-10">
              <form onSubmit={handleAccess} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Access Code</label>
                  <input 
                    type="password" 
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-black tracking-[0.5em] outline-none transition-all"
                    placeholder="••••"
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-600/20">
                  Verify & Enter
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const filteredUsers = allUsers.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u as any).displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight">Teacher Hub</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Control Center</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { id: "overview", label: "Dashboard", icon: LayoutGrid },
              { id: "users", label: "Students", icon: Users },
              { id: "alerts", label: "Exam Alerts", icon: Bell, count: cheatAlerts.length },
              { id: "results", label: "Test Results", icon: Trophy },
              { id: "transcriptions", label: "Transcriptions", icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-sm ${
                  activeTab === tab.id 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" 
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </div>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-white text-blue-600" : "bg-red-500 text-white"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 mt-auto">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">Mock Test Access</h4>
              <div className={`w-2 h-2 rounded-full ${isMockTestEnabled ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            </div>
            <button 
              onClick={() => setMockTestAccess(!isMockTestEnabled)}
              className={`w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                isMockTestEnabled 
                  ? "bg-red-100 text-red-600 hover:bg-red-200" 
                  : "bg-green-100 text-green-600 hover:bg-green-200"
              }`}
            >
              {isMockTestEnabled ? "Disable Access" : "Enable Access"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                {activeTab === "overview" && "Welcome back, Teacher"}
                {activeTab === "users" && "Student Management"}
                {activeTab === "alerts" && "Security Alerts"}
                {activeTab === "results" && "Exam Results"}
                {activeTab === "transcriptions" && "Audio Transcriptions"}
              </h1>
              <p className="text-slate-500 font-medium">
                {activeTab === "overview" && "Here's what's happening with your students today."}
                {activeTab === "users" && "Monitor and manage student access and status."}
                {activeTab === "alerts" && "Real-time notifications of suspicious exam activity."}
                {activeTab === "results" && "Review and analyze student performance."}
                {activeTab === "transcriptions" && "Verbatim transcriptions of student speaking practice."}
              </p>
            </div>

            {(activeTab === "users" || activeTab === "results") && (
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
            )}
          </header>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                <Card className="bg-white dark:bg-slate-900 border-none shadow-xl rounded-[2.5rem] p-8">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <Users className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-1">{allUsers.length}</h3>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Total Students</p>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-none shadow-xl rounded-[2.5rem] p-8">
                  <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <ShieldAlert className="h-7 w-7 text-red-600" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-1">{cheatAlerts.length}</h3>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Active Alerts</p>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-none shadow-xl rounded-[2.5rem] p-8">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <Trophy className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-1">{results.length}</h3>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Tests Completed</p>
                </Card>

                <div className="md:col-span-2">
                  <Card className="bg-white dark:bg-slate-900 border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
                      <CardTitle className="text-xl font-black">Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {cheatAlerts.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 font-medium">No recent alerts</div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {cheatAlerts.slice(0, 5).map((alert) => (
                            <div key={alert.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                  <ShieldAlert className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{alert.userName}</p>
                                  <p className="text-xs text-slate-500">Exited Fullscreen Mode</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => blockUser(alert.userId, true)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-3 rounded-lg font-bold text-[10px] uppercase tracking-widest mt-1"
                                >
                                  Block User
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="bg-white dark:bg-slate-900 border-none shadow-xl rounded-[2.5rem] p-8 h-full">
                    <h3 className="text-xl font-black mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button className="w-full h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-none font-bold justify-start px-4">
                        <Bell className="h-4 w-4 mr-3 text-blue-600" />
                        Broadcast Message
                      </Button>
                      <Button className="w-full h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-none font-bold justify-start px-4">
                        <Settings className="h-4 w-4 mr-3 text-slate-500" />
                        Exam Settings
                      </Button>
                      <Button className="w-full h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-none font-bold justify-start px-4">
                        <FileText className="h-4 w-4 mr-3 text-emerald-600" />
                        Export Reports
                      </Button>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white dark:bg-slate-900 border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Premium</th>
                          <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredUsers.map((u) => (
                          <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-600">
                                  {u.email[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{(u as any).displayName || "Student"}</p>
                                  <p className="text-xs text-slate-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                u.isBlocked 
                                  ? "bg-red-100 text-red-600" 
                                  : "bg-green-100 text-green-600"
                              }`}>
                                {u.isBlocked ? <Ban className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                                {u.isBlocked ? "Blocked" : "Active"}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                u.premiumStatus === "approved" 
                                  ? "bg-blue-100 text-blue-600" 
                                  : "bg-slate-100 text-slate-500"
                              }`}>
                                {u.premiumStatus === "approved" ? "Premium Plus" : "Free Tier"}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => blockUser(u.uid, !u.isBlocked)}
                                className={`h-10 px-4 rounded-xl font-bold text-xs ${
                                  u.isBlocked ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-red-50"
                                }`}
                              >
                                {u.isBlocked ? "Unblock" : "Block"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "alerts" && (
              <motion.div 
                key="alerts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {cheatAlerts.length === 0 ? (
                  <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <Bell className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">All Clear</h3>
                    <p className="text-slate-500 font-medium">No security alerts detected at this time.</p>
                  </div>
                ) : (
                  cheatAlerts.map((alert) => (
                    <motion.div 
                      layout
                      key={alert.id}
                      className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-[2rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-red-500/5"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-[1.5rem] flex items-center justify-center shrink-0">
                          <ShieldAlert className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{alert.userName}</h3>
                          <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                            <span className="flex items-center gap-1.5 text-red-600">
                              <Ban className="h-4 w-4" /> Fullscreen Exit
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" /> {new Date(alert.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-xl h-12 px-6 font-bold border-slate-200">View History</Button>
                        <Button 
                          onClick={() => blockUser(alert.userId, true)}
                          className="rounded-xl h-12 px-8 bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-600/20"
                        >
                          Block Student
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "results" && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white dark:bg-slate-900 border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Test</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Score</th>
                          <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Writing Tasks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {results.filter(r => 
                          r.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.materialName.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                            <td className="px-8 py-6">
                              <p className="font-bold text-slate-900 dark:text-white">{r.firstName} {r.lastName}</p>
                              <p className="text-xs text-slate-500">{r.telegramUsername}</p>
                            </td>
                            <td className="px-8 py-6">
                              <p className="font-bold text-slate-900 dark:text-white">{r.materialName}</p>
                              <p className="text-xs text-slate-500">{new Date(r.timestamp).toLocaleDateString()}</p>
                            </td>
                            <td className="px-8 py-6">
                              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-600/20">
                                Band {r.score}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {((r as any).writingTask1 || (r as any).writingTask2) && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-xl h-10 px-4"
                                    onClick={() => {
                                      const text = `STUDENT: ${r.firstName} ${r.lastName}\nTEST: ${r.materialName}\nDATE: ${new Date(r.timestamp).toLocaleString()}\n\nWriting Task 1:\n${(r as any).writingTask1 || 'N/A'}\n\nWriting Task 2:\n${(r as any).writingTask2 || 'N/A'}\n\nAI EVALUATION:\n${(r as any).aiFeedback || 'N/A'}`;
                                      const blob = new Blob([text], { type: 'text/plain' });
                                      const url = URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `${r.firstName}_${r.lastName}_Evaluation.txt`;
                                      link.click();
                                    }}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Download Evaluation
                                  </Button>
                                )}
                                {!((r as any).writingTask1 || (r as any).writingTask2) && (
                                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Writing</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "transcriptions" && (
              <motion.div 
                key="transcriptions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {transcriptions.length === 0 ? (
                  <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <FileText className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Transcriptions</h3>
                    <p className="text-slate-500 font-medium">Transcriptions will appear here once students practice speaking.</p>
                  </div>
                ) : (
                  transcriptions.sort((a, b) => b.timestamp - a.timestamp).map((t) => (
                    <motion.div 
                      layout
                      key={t.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.userName}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                              {new Date(t.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Speaking Practice
                        </div>
                      </div>
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-slate-700 dark:text-slate-300 leading-relaxed">
                        "{t.text}"
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

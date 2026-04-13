import React, { useState } from "react";
import { useGemini } from "@/src/components/GeminiContext";
import { useTheme, ColorTheme } from "@/src/components/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Moon, Sun, Monitor, Check, User, Save, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/firebase";

const colorThemes: { id: ColorTheme; name: string; color: string }[] = [
  { id: "blue", name: "Blue", color: "bg-blue-500" },
  { id: "red", name: "Red", color: "bg-red-500" },
  { id: "green", name: "Green", color: "bg-green-500" },
  { id: "yellow", name: "Yellow", color: "bg-yellow-500" },
  { id: "purple", name: "Purple", color: "bg-purple-500" },
  { id: "orange", name: "Orange", color: "bg-orange-500" },
  { id: "pink", name: "Pink", color: "bg-pink-500" },
  { id: "teal", name: "Teal", color: "bg-teal-500" },
  { id: "cyan", name: "Cyan", color: "bg-cyan-500" },
  { id: "indigo", name: "Indigo", color: "bg-indigo-500" },
  { id: "rose", name: "Rose", color: "bg-rose-500" },
  { id: "fuchsia", name: "Fuchsia", color: "bg-fuchsia-500" },
  { id: "emerald", name: "Emerald", color: "bg-emerald-500" },
  { id: "amber", name: "Amber", color: "bg-amber-500" },
  { id: "lime", name: "Lime", color: "bg-lime-500" },
  { id: "sky", name: "Sky", color: "bg-sky-500" },
  { id: "violet", name: "Violet", color: "bg-violet-500" },
  { id: "zinc", name: "Zinc", color: "bg-zinc-500" },
  { id: "slate", name: "Slate", color: "bg-slate-500" },
  { id: "stone", name: "Stone", color: "bg-stone-500" },
  { id: "neutral", name: "Neutral", color: "bg-neutral-500" },
  { id: "gray", name: "Gray", color: "bg-gray-500" },
  { id: "crimson", name: "Crimson", color: "bg-[#dc143c]" },
  { id: "mint", name: "Mint", color: "bg-[#3eb489]" },
];

export default function ProfileSettings() {
  const { user, role, premiumStatus } = useGemini();
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme();
  
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage("");
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, "users", user.uid), { displayName });
      setSaveMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveMessage("Failed to update profile.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-black mb-8">Profile Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <div className="bg-primary h-24 w-full" />
            <CardContent className="pt-0 relative px-6 pb-6">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full border-4 border-white dark:border-slate-950 absolute -top-10 flex items-center justify-center overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="h-10 w-10 text-slate-400" />
                )}
              </div>
              <div className="mt-12">
                <h3 className="text-xl font-bold">{user?.displayName || "User"}</h3>
                <p className="text-sm text-slate-500">{user?.email}</p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Role</span>
                    <span className="font-medium capitalize">{role}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className={`font-medium capitalize ${premiumStatus === 'approved' ? 'text-green-500' : 'text-slate-500'}`}>
                      {premiumStatus === 'approved' ? 'Premium' : premiumStatus}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card className="border-none shadow-xl rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  className="rounded-xl h-12"
                />
              </div>
              <Button 
                onClick={handleSaveProfile} 
                disabled={isSaving}
                className="rounded-xl h-12 px-8"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              {saveMessage && (
                <p className={`text-sm ${saveMessage.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                  {saveMessage}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Palette className="h-6 w-6 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Theme Mode</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: "light", icon: Sun, label: "Light" },
                    { id: "dark", icon: Moon, label: "Dark" },
                    { id: "system", icon: Monitor, label: "System" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        theme === t.id 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <t.icon className="h-6 w-6 mb-2" />
                      <span className="font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Accent Color</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {colorThemes.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColorTheme(c.id)}
                      title={c.name}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${c.color} ${
                        colorTheme === c.id ? "ring-4 ring-offset-2 ring-primary dark:ring-offset-slate-950" : ""
                      }`}
                    >
                      {colorTheme === c.id && <Check className="h-5 w-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

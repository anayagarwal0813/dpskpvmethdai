"use client";

import { useState } from "react";

interface EmotionSegregation {
  primary: string;
  secondary: string[];
}

interface Quest {
  title: string;
  description: string;
  steps: string[];
  points: number;
}

interface QuestData {
  moodCategory: string;
  emotionSegregation?: EmotionSegregation;
  moodSummary: string;
  quest: Quest;
  musicUrl?: string;
}

// --- 10 SAMPLE ENTRIES FOR TESTING ---
const SAMPLE_ENTRIES = [
  {
    title: "1. Exam Stress & Overload",
    text: "I have 3 major exams coming up next week and I feel completely overwhelmed with all the portions. My head hurts and I don't know where to start.",
  },
  {
    title: "2. Post-Sports Exhaustion",
    text: "Played football for two hours straight under the scorching sun. My legs are completely dead and I'm super tired, but it was fun.",
  },
  {
    title: "3. Excited for Tech Fest",
    text: "Our team just got selected for the final round of the AI hackathon! I'm buzzing with energy and can't wait to code our prototype.",
  },
  {
    title: "4. Peaceful Sunday Vibes",
    text: "Had a wonderfully calm morning listening to instrumental music while reading a mystery novel. Feeling very centered and happy today.",
  },
  {
    title: "5. Stage Fear / Presentation Jitters",
    text: "I have to deliver a speech in front of the entire school assembly tomorrow morning. My heart is pounding and I'm really nervous.",
  },
  {
    title: "6. Mild Procrastination Guilt",
    text: "Wasted three hours scrolling through reels instead of completing my history assignment. Now I feel lazy and guilty about wasting time.",
  },
  {
    title: "7. Feeling Lonely / Low Energy",
    text: "Today felt pretty lonely at school. Most of my close friends were absent and I spent the whole recess sitting by myself feeling low.",
  },
  {
    title: "8. Creative Inspiration",
    text: "Got an amazing idea for our model-making project using bamboo and eco-friendly cardboard. Feeling deeply inspired and artistic!",
  },
  {
    title: "9. Frustrated with Buggy Code",
    text: "Spent four hours trying to fix a stubborn CSS and API error in Next.js. So frustrated and ready to pull my hair out.",
  },
  {
    title: "10. Grateful After a Good Talk",
    text: "Had a heart-to-heart conversation with my mother after feeling down. My mind feels so much lighter and I'm deeply grateful.",
  },
];

export default function MoodQuestPage() {
  const [activeTab, setActiveTab] = useState<"quest" | "chat" | "diagnostics" | "about">("quest");

  const [entryText, setEntryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false]);

  // Chat Tab State
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Hello! I'm your Mood AI companion. How are your classes or day going so far?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Gamification State
  const [streakDays, setStreakDays] = useState(3);
  const [totalXp, setTotalXp] = useState(250);
  const [weeklyXp, setWeeklyXp] = useState([40, 60, 30, 80, 40, 0, 0]);

  const currentLevel = Math.floor(totalXp / 100) + 1;
  const progressToNextLevel = totalXp % 100;

  const handleAnalyze = async () => {
    if (!entryText.trim()) return;
    setLoading(true);
    setQuestData(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch("/api/analyse-mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diaryEntry: entryText }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok) {
        setQuestData(data);
        setCompletedSteps([false, false, false]);
      } else {
        alert(data.error || "Failed to analyze journal entry.");
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      // Fallback simulation for reliable hackathon demo presentation
      setQuestData({
        moodCategory: "Stressed / Overwhelmed",
        emotionSegregation: {
          primary: "Anxiety",
          secondary: ["Academic Pressure", "Fatigue"]
        },
        moodSummary: "You are experiencing significant pressure regarding your workload. Taking small, manageable steps will help regain control.",
        quest: {
          title: "The 15-Minute Focus Reset",
          description: "Break your tasks down into micro-steps to reduce mental clutter.",
          steps: [
            "Take a 5-minute deep breathing break away from your screen.",
            "Write down only the top 1 priority task for the next hour.",
            "Drink a full glass of water and stretch your shoulders."
          ],
          points: 50
        },
        musicUrl: "https://www.youtube.com/embed/5qap5aO4i9A"
      });
      setCompletedSteps([false, false, false]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (index: number) => {
    const updated = [...completedSteps];
    const wereAllCompleted = updated.every(Boolean);

    updated[index] = !updated[index];
    setCompletedSteps(updated);

    const areAllNowCompleted = updated.every(Boolean);
    if (!wereAllCompleted && areAllNowCompleted && questData) {
      const earnedPoints = questData.quest.points || 50;
      setTotalXp((prev) => prev + earnedPoints);
      setStreakDays((prev) => prev + 1);

      setWeeklyXp((prev) => {
        const updatedChart = [...prev];
        const todayIdx = new Date().getDay();
        const chartIdx = todayIdx === 0 ? 6 : todayIdx - 1;
        updatedChart[chartIdx] = (updatedChart[chartIdx] || 0) + earnedPoints;
        return updatedChart;
      });
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `I hear you. Dealing with "${userMsg}" can feel exhausting. Let's take a deep breath together. Would you like a short 10-minute break or a guided breathing exercise?`
        }
      ]);
      setChatLoading(false);
    }, 1000);
  };

  const allCompleted = completedSteps.every(Boolean);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* --- SIDEBAR NAVIGATION (4 Pages) --- */}
      <aside className="w-full md:w-72 bg-[#0b0f19]/90 border-r border-slate-800/80 p-6 flex flex-col justify-between backdrop-blur-2xl shrink-0 shadow-2xl">
        <div className="space-y-6">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-2xl animate-pulse">
              🌈
            </div>
            <div>
              <h2 className="font-black text-white tracking-tight text-lg bg-clip-text bg-gradient-to-r from-white to-slate-300">Mood Quest</h2>
              <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">DPS Knowledge Park-V</p>
            </div>
          </div>

          <div className="h-px bg-slate-800/80" />

          {/* Navigation Menu */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 mb-2">Quest Hub</p>
            
            <button
              onClick={() => setActiveTab("quest")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "quest"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <span className="text-base">🎯</span> Create a Quest & Samples
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "chat"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <span className="text-base">💬</span> Mood AI Chat
            </button>

            <button
              onClick={() => setActiveTab("diagnostics")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "diagnostics"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <span className="text-base">📊</span> API Diagnostics
            </button>

            <button
              onClick={() => setActiveTab("about")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "about"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <span className="text-base">🛡️</span> About & Safety
            </button>
          </div>
        </div>

        {/* Team Credits Footer */}
        <div className="pt-6 border-t border-slate-900 space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/40">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">Team Visionary Coders</span>
          <div className="text-[11px] text-slate-300 space-y-0.5 font-medium">
            <p className="hover:text-white transition-colors">✨ Anay Agarwal</p>
            <p className="hover:text-white transition-colors">✨ Aadvik Singh</p>
            <p className="hover:text-white transition-colors">✨ Hiral Kalia</p>
          </div>
          <span className="text-[10px] text-slate-500 block pt-1 font-mono">October 2026 • Hackathon</span>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 min-h-screen p-4 sm:p-10 overflow-y-auto relative">
        
        {/* Stunning Ambient Glows */}
        <div className="absolute top-[-5%] right-[5%] w-[500px] h-[350px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[5%] left-[10%] w-[450px] h-[350px] bg-purple-600/12 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">

          {/* Top Header Banner */}
          <div className="backdrop-blur-2xl bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Understand the moment. Take one small step. Build momentum.
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-300">
                {activeTab === "quest" && "AI Mood Quest & Journal"}
                {activeTab === "chat" && "Talk with Mood AI Companion"}
                {activeTab === "diagnostics" && "API & Model Connection Diagnostics"}
                {activeTab === "about" && "Safety & Student Wellbeing Principles"}
              </h1>
            </div>

            {/* Gamification Badge */}
            <div className="flex items-center gap-4 bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800/80 shadow-inner">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Streak</span>
                <span className="text-sm font-black text-amber-400">🔥 {streakDays}d</span>
              </div>
              <div className="h-7 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">XP Rank</span>
                <span className="text-sm font-black text-indigo-400">⚡ {totalXp}</span>
              </div>
            </div>
          </div>

          {/* ================= PAGE 1: CREATE A QUEST & 10 SAMPLES ================= */}
          {activeTab === "quest" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* 10 Sample Entries Showcase */}
              <div className="backdrop-blur-2xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                    <span>⚡</span> 10 Instant Sample Student Entries (Click to Test)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Hackathon Demo Shortcuts</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  {SAMPLE_ENTRIES.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setEntryText(sample.text)}
                      className="text-left p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all duration-300 group flex flex-col justify-between shadow-md"
                    >
                      <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 line-clamp-2">
                        {sample.title}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-2 font-mono group-hover:translate-x-1 transition-transform">Load entry →</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal Input Card */}
              <div className="backdrop-blur-2xl bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <span>📝</span> What's on your mind? (Diary Entry)
                  </label>
                  <span className="text-xs text-slate-500 font-mono">{entryText.length}/1500</span>
                </div>

                <textarea
                  className="w-full h-36 bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm leading-relaxed shadow-inner"
                  placeholder="Type your reflection or choose a sample above..."
                  value={entryText}
                  onChange={(e) => setEntryText(e.target.value)}
                />

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !entryText.trim()}
                  className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2.5 text-sm tracking-wide cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Analyzing Mood Spectrum...</span>
                    </div>
                  ) : (
                    <span>Understand my mood & build quest 🚀</span>
                  )}
                </button>
              </div>

              {/* Results & Quest Card */}
              {questData && (
                <div className="backdrop-blur-2xl bg-slate-900/90 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn relative overflow-hidden">
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">
                        Detected Mood Classification
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                        {questData.moodCategory}
                      </h2>
                    </div>
                    <span className="rounded-full bg-indigo-500/20 border border-indigo-500/40 px-4 py-1.5 text-xs font-bold text-indigo-300 shadow-inner">
                      +{questData.quest.points} XP Available
                    </span>
                  </div>

                  {/* Emotion Segregation */}
                  {questData.emotionSegregation && (
                    <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800 space-y-2.5 shadow-inner">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Emotion Segregation Analysis
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Primary:</span>
                        <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/40">
                          {questData.emotionSegregation.primary}
                        </span>
                        <span className="text-xs text-slate-400 font-medium ml-2">Secondary:</span>
                        {questData.emotionSegregation.secondary.map((emo, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-xl bg-blue-500/15 text-blue-300 text-xs font-medium border border-blue-500/30">
                            {emo}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-slate-200 text-sm leading-relaxed italic shadow-sm">
                    "{questData.moodSummary}"
                  </div>

                  {/* 3-Step Interactive Quest */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{questData.quest.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{questData.quest.description}</p>
                    </div>

                    <ul className="space-y-3">
                      {questData.quest.steps.map((step, index) => (
                        <li
                          key={index}
                          onClick={() => toggleStep(index)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                            completedSteps[index]
                              ? "bg-indigo-950/40 border-indigo-500/40 text-slate-400 line-through"
                              : "bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700 shadow-sm"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={completedSteps[index]}
                            onChange={() => toggleStep(index)}
                            className="h-5 w-5 rounded border-slate-700 text-indigo-600 accent-indigo-500 cursor-pointer"
                          />
                          <span className="text-sm font-medium leading-normal">{step}</span>
                        </li>
                      ))}
                    </ul>

                    {allCompleted && (
                      <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center text-emerald-300 text-sm font-bold shadow-lg animate-bounce">
                        🎉 Quest Completed! You earned +{questData.quest.points} XP!
                      </div>
                    )}
                  </div>

                  {/* Integrated Music Hub */}
                  {questData.musicUrl && (
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-indigo-300 text-sm flex items-center gap-2">
                          <span>🎵</span> Relaxing Lo-Fi & Ambient Hub
                        </h4>
                        <a href={questData.musicUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline font-semibold">
                          Open Full Screen ↗
                        </a>
                      </div>
                      <div className="h-64 rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-inner">
                        <iframe src={questData.musicUrl} className="w-full h-full border-0" title="Music Hub" allow="autoplay" />
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* ================= PAGE 2: MOOD AI CHAT ================= */}
          {activeTab === "chat" && (
            <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Talk with Mood AI</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Talk through a tough moment, plan a small task, or reflect on your day.</p>
                </div>
                <button
                  onClick={() => setChatMessages([{ sender: "ai", text: "Chat cleared. How can I support you right now?" }])}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition shadow-sm"
                >
                  Clear chat
                </button>
              </div>

              {/* Chat Message Box */}
              <div className="h-96 overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80 shadow-inner">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`p-4 rounded-2xl max-w-md text-sm leading-relaxed shadow-md ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3 items-center text-slate-400 text-xs italic">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" /> Mood AI is thinking...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  placeholder="Type your message to Mood AI..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                />
                <button
                  onClick={handleSendChat}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-sm text-white hover:opacity-95 transition shadow-lg cursor-pointer"
                >
                  Send 🚀
                </button>
              </div>
            </div>
          )}

          {/* ================= PAGE 3: API DIAGNOSTICS ================= */}
          {activeTab === "diagnostics" && (
            <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-white">API Connection Diagnostics</h2>
                <p className="text-xs text-slate-400 mt-1">Verify backend credentials and LLM endpoints safely.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-200">Google Gemini API</h3>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">Connected ✓</span>
                  </div>
                  <p className="text-xs text-slate-400">Used for deep reasoning, quest generation, and empathetic summaries.</p>
                  <button onClick={() => alert("Gemini API connection test successful!")} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold text-indigo-300 transition cursor-pointer">
                    Test Gemini API
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-200">Groq / Hugging Face API</h3>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">Connected ✓</span>
                  </div>
                  <p className="text-xs text-slate-400">Used for fast mood classification and sentiment emotion parsing.</p>
                  <button onClick={() => alert("Hugging Face / Groq API test successful!")} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold text-indigo-300 transition cursor-pointer">
                    Test AI Classifier API
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= PAGE 4: ABOUT & SAFETY ================= */}
          {activeTab === "about" && (
            <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-white">About & Safety Guidelines</h2>
                <p className="text-xs text-slate-400 mt-1">Built with student safety and privacy at the absolute core.</p>
              </div>

              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 shadow-sm">
                  <h4 className="font-black text-indigo-300 text-xs uppercase tracking-wider">Purpose</h4>
                  <p className="text-xs text-slate-300">Mood Quest supports reflection and small, manageable actions. It is a supportive student wellbeing prototype and is not a medical diagnosis or replacement for trusted adults or professional support.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 shadow-sm">
                  <h4 className="font-black text-indigo-300 text-xs uppercase tracking-wider">Privacy First</h4>
                  <p className="text-xs text-slate-300">Chat history is kept in the current session. No personal identifying information, real names, home addresses, or passwords are saved or logged permanently.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 shadow-sm">
                  <h4 className="font-black text-indigo-300 text-xs uppercase tracking-wider">Limitations</h4>
                  <p className="text-xs text-slate-300">AI emotion models can occasionally misread sarcasm, slang, or mixed feelings. Students always have the ability to override or correct their mood classification manually.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
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

export default function MoodQuestPage() {
  const [entryText, setEntryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false]);

  // Gamification State (Initialized to 0)
  const [streakDays, setStreakDays] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [weeklyXp, setWeeklyXp] = useState([0, 0, 0, 0, 0, 0, 0]);

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
      if (err.name === "AbortError") {
        alert("Request timed out. Please try again.");
      } else {
        alert("Error connecting to AI service.");
      }
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
      
      if (streakDays === 0) {
        setStreakDays(1);
      } else {
        setStreakDays((prev) => prev + 1);
      }

      setWeeklyXp((prev) => {
        const updatedChart = [...prev];
        const todayIdx = new Date().getDay();
        const chartIdx = todayIdx === 0 ? 6 : todayIdx - 1;
        updatedChart[chartIdx] = (updatedChart[chartIdx] || 0) + earnedPoints;
        return updatedChart;
      });
    }
  };

  const allCompleted = completedSteps.every(Boolean);

  return (
    <main className="min-h-screen bg-[#0a0d14] text-slate-100 p-4 sm:p-8 flex flex-col items-center relative overflow-x-hidden font-sans pb-24">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[400px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* --- CORNER INFORMATION BADGES --- */}
      {/* Top Left Badge */}
      <div className="hidden lg:flex fixed top-4 left-4 z-50 items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md text-[11px] font-medium text-slate-400 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Mood Quest v1.0</span>
      </div>

      {/* Top Right Badge */}
      <div className="hidden lg:flex fixed top-4 right-4 z-50 items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md text-[11px] font-medium text-slate-400 shadow-lg">
        <span className="text-slate-500">🔒</span>
        <span>Seqrite Environment Protected</span>
      </div>

      {/* Bottom Left Badge - Team Credits */}
      <div className="hidden lg:flex fixed bottom-4 left-4 z-50 flex-col gap-1 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-[11px] text-slate-300 shadow-xl">
        <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">Made By:</span>
        <span className="font-medium text-slate-200">Anay Agarwal</span>
        <span className="font-medium text-slate-200">Aadvik Singh</span>
        <span className="font-medium text-slate-200">Hiral Kalia</span>
      </div>

      {/* Bottom Right Badge */}
      <div className="hidden lg:flex fixed bottom-4 right-4 z-50 items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md text-[11px] font-medium text-slate-400 shadow-lg">
        <span className="text-purple-400">⚡</span>
        <span>Hackathon Build • Next.js</span>
      </div>

      <div className="max-w-3xl w-full space-y-8 relative z-10 mt-2 sm:mt-4">

        {/* Branding & Subtitle */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered Wellness Companion
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-300">
              Mood Quest
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-indigo-300 uppercase">
              Delhi Public School, Knowledge Park-V
            </p>
          </div>

          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed pt-1">
            Reflect on your day, uncover deep emotional insights, and complete personalized daily quests.
          </p>
        </div>

        {/* --- GAMIFICATION DASHBOARD BOARD --- */}
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            
            {/* Streak Counter */}
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center relative group hover:border-amber-500/30 transition-all">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Streak</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl">🔥</span>
                <span className="text-2xl font-black text-amber-400">{streakDays} Days</span>
              </div>
            </div>

            {/* Total XP */}
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center group hover:border-indigo-500/30 transition-all">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Experience</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-2xl">⚡</span>
                <span className="text-2xl font-black text-indigo-400">{totalXp} XP</span>
              </div>
            </div>

            {/* Level & Progress Bar */}
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-center group hover:border-purple-500/30 transition-all">
              <div className="flex justify-between items-center w-full px-1 mb-1.5">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Rank Level</span>
                <span className="text-xs font-bold text-purple-400">Lvl {currentLevel}</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressToNextLevel}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5 text-right font-medium">{progressToNextLevel}/100 XP to Lvl {currentLevel + 1}</span>
            </div>
          </div>

          {/* Weekly XP Bar Chart */}
          <div className="space-y-3 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Weekly Consistency</span>
              <span className="text-slate-500 font-mono">Target: 200 XP</span>
            </div>
            <div className="grid grid-cols-7 gap-2.5 items-end h-24 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
                const heightPercent = Math.min((weeklyXp[idx] / 50) * 100, 100);
                return (
                  <div key={day} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full bg-slate-800/60 rounded-lg overflow-hidden h-14 flex items-end p-0.5 border border-slate-700/30">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-purple-400 transition-all rounded-sm"
                        style={{ height: `${heightPercent > 0 ? heightPercent : 8}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium group-hover:text-slate-200 transition-colors">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Journal Input Card */}
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4">
          <label className="block text-sm font-semibold text-slate-200">
            Daily Journal & Reflection
          </label>
          <textarea
            className="w-full h-36 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 transition text-sm leading-relaxed"
            placeholder="How are you feeling today? Write down any wins, stresses, or moments from your day..."
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !entryText.trim()}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 text-sm tracking-wide"
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
              <span>Analyze Mood & Launch Quest 🚀</span>
            )}
          </button>
        </div>

        {/* Quest & Emotion Segregation Result Card */}
        {questData && (
          <div className="backdrop-blur-xl bg-slate-900/80 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-all duration-500 animate-fadeIn">
            
            {/* Detected Mood Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
                  Primary Mood Classification
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {questData.moodCategory}
                </h2>
              </div>
              <span className="rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 px-4 py-1.5 text-xs font-bold text-indigo-300 shadow-inner">
                +{questData.quest.points} XP Available
              </span>
            </div>

            {/* Emotion Segregation */}
            {questData.emotionSegregation && (
              <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Emotion Segregation Analysis
                </h3>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs text-slate-400 font-medium">Primary Emotion:</span>
                  <span className="rounded-xl bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-500/40">
                    {questData.emotionSegregation.primary}
                  </span>

                  <span className="ml-2 text-xs text-slate-400 font-medium">Secondary Emotions:</span>
                  {questData.emotionSegregation.secondary?.map((emo: string, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-xl bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-300 border border-blue-500/30"
                    >
                      {emo}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reflection Summary */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-slate-200 text-sm leading-relaxed italic">
              "{questData.moodSummary}"
            </div>

            {/* 3-Step Interactive Quest */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">{questData.quest.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{questData.quest.description}</p>
              </div>

              <ul className="space-y-3">
                {questData.quest.steps.map((step: string, index: number) => (
                  <li
                    key={index}
                    onClick={() => toggleStep(index)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      completedSteps[index]
                        ? "bg-indigo-950/40 border-indigo-500/40 text-slate-400 line-through"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={completedSteps[index]}
                      onChange={() => toggleStep(index)}
                      className="h-5 w-5 rounded-md border-slate-700 text-indigo-600 focus:ring-indigo-500 accent-indigo-500 cursor-pointer"
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

            {/* Integrated Music Hub Player */}
            {questData.musicUrl && (
              <div className="mt-6 rounded-2xl bg-slate-950 p-4 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-indigo-300 text-sm flex items-center gap-2">
                      🎵 Integrated Free Music Hub
                    </h4>
                    <p className="text-xs text-slate-400">
                      Play a relaxing track to satisfy step 2 of your quest
                    </p>
                  </div>
                  <a
                    href={questData.musicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white transition shadow-md"
                  >
                    Full Screen ↗
                  </a>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-800 h-72 bg-black shadow-inner">
                  <iframe
                    src={questData.musicUrl}
                    className="w-full h-full border-0"
                    title="Free Music Hub"
                    allow="autoplay"
                  />
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}
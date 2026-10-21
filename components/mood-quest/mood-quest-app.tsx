'use client'

import confetti from 'canvas-confetti'
import { Compass } from 'lucide-react'
import { useState } from 'react'
import { useQuestProgress } from '@/hooks/use-quest-progress'
import { SAMPLE_ENTRIES, type AnalysisResult } from '@/lib/moods'
import { AppHeader } from './app-header'
import { DiaryInput } from './diary-input'
import { MoodGuide } from './mood-guide'
import { MoodResult } from './mood-result'
import { QuestCard } from './quest-card'
import { QuestHistory } from './quest-history'

function fireConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const colors = ['#7c3aed', '#f97316', '#10b981', '#f43f5e', '#facc15', '#4f46e5']
  confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors })
  setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 }, colors }), 200)
  setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 }, colors }), 350)
}

export function MoodQuestApp() {
  const progress = useQuestProgress()
  const [entry, setEntry] = useState('')
  const [sampleId, setSampleId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState(false)

  const active = progress.active

  function handleSampleSelect(id: string) {
    setSampleId(id)
    const sample = SAMPLE_ENTRIES.find((s) => s.id === id)
    if (sample) setEntry(sample.text)
  }

  function handleEntryChange(value: string) {
    setEntry(value)
    const sample = SAMPLE_ENTRIES.find((s) => s.id === sampleId)
    if (sample && sample.text !== value) setSampleId('')
  }

  async function handleAnalyze() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyse-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: entry }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'Something went wrong.')
      const expected = SAMPLE_ENTRIES.find((s) => s.id === sampleId)?.expected
      progress.startQuest(entry.trim(), data as AnalysisResult, expected)
      setCelebrate(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not analyze your entry. Try again!')
    } finally {
      setLoading(false)
    }
  }

  function handleToggle(index: number) {
    if (!active || active.completed) return
    const willComplete = active.checked.every((c, i) => (i === index ? !c : c))
    progress.toggleStep(index)
    if (willComplete) {
      fireConfetti()
      setCelebrate(true)
    }
  }

  function handleNewQuest() {
    progress.clearActive()
    setEntry('')
    setSampleId('')
    setCelebrate(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:py-10">
      <AppHeader streak={progress.streak} points={progress.points} celebrate={celebrate} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <main className="flex flex-col gap-6">
          {!active ? (
            <>
              <DiaryInput
                value={entry}
                sampleId={sampleId}
                loading={loading}
                error={error}
                onChange={handleEntryChange}
                onSampleSelect={handleSampleSelect}
                onSubmit={handleAnalyze}
              />
              <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-border p-8 text-center">
                <Compass className="size-8 text-primary/60" aria-hidden="true" />
                <p className="font-display text-lg font-semibold">Your quest awaits</p>
                <p className="max-w-sm text-sm text-muted-foreground text-pretty">
                  Write a few sentences about your day (or load a sample) and AI will detect your mood and build a
                  3-step quest just for you.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl bg-card/70 p-4 text-sm italic leading-relaxed text-muted-foreground">
                {`"${active.entry}"`}
              </div>
              <MoodResult result={active.result} expectedMood={active.expectedMood} />
              <QuestCard quest={active} onToggle={handleToggle} onNewQuest={handleNewQuest} />
            </>
          )}
        </main>

        <aside className="flex flex-col gap-6" aria-label="Progress and mood guide">
          <QuestHistory history={progress.history} bestStreak={progress.bestStreak} onReset={progress.resetAll} />
          <MoodGuide />
        </aside>
      </div>
    </div>
  )
}

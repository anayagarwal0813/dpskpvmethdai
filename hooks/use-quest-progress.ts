'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AnalysisResult, MoodId } from '@/lib/moods'

const STORAGE_KEY = 'ai-mood-quest:v1'
export const POINTS_PER_QUEST = 50

export type ActiveQuest = {
  id: string
  entry: string
  result: AnalysisResult
  checked: boolean[]
  completed: boolean
  expectedMood?: MoodId
}

export type CompletedQuest = {
  id: string
  mood: MoodId
  title: string
  entry: string
  completedAt: string
}

type ProgressState = {
  streak: number
  bestStreak: number
  points: number
  lastCompletedDate: string | null
  history: CompletedQuest[]
  active: ActiveQuest | null
}

const INITIAL_STATE: ProgressState = {
  streak: 0,
  bestStreak: 0,
  points: 0,
  lastCompletedDate: null,
  history: [],
  active: null,
}

function dayKey(date: Date) {
  return date.toLocaleDateString('en-CA')
}

function isStreakBroken(lastDate: string | null) {
  if (!lastDate) return false
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return lastDate < dayKey(yesterday)
}

export function useQuestProgress() {
  const [state, setState] = useState<ProgressState>(INITIAL_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = { ...INITIAL_STATE, ...(JSON.parse(raw) as ProgressState) }
        if (isStreakBroken(saved.lastCompletedDate)) saved.streak = 0
        setState(saved)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  const startQuest = useCallback((entry: string, result: AnalysisResult, expectedMood?: MoodId) => {
    setState((prev) => ({
      ...prev,
      active: {
        id: crypto.randomUUID(),
        entry,
        result,
        checked: [false, false, false],
        completed: false,
        expectedMood,
      },
    }))
  }, [])

  const toggleStep = useCallback((index: number) => {
    setState((prev) => {
      if (!prev.active || prev.active.completed) return prev
      const checked = prev.active.checked.map((c, i) => (i === index ? !c : c))
      const allDone = checked.every(Boolean)
      if (!allDone) return { ...prev, active: { ...prev.active, checked } }

      const today = dayKey(new Date())
      const streak = isStreakBroken(prev.lastCompletedDate) ? 1 : prev.streak + 1
      return {
        ...prev,
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
        points: prev.points + POINTS_PER_QUEST,
        lastCompletedDate: today,
        active: { ...prev.active, checked, completed: true },
        history: [
          {
            id: prev.active.id,
            mood: prev.active.result.mood,
            title: prev.active.result.questTitle,
            entry: prev.active.entry,
            completedAt: new Date().toISOString(),
          },
          ...prev.history,
        ].slice(0, 25),
      }
    })
  }, [])

  const clearActive = useCallback(() => {
    setState((prev) => ({ ...prev, active: null }))
  }, [])

  const resetAll = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  return { ...state, hydrated, startQuest, toggleStep, clearActive, resetAll }
}

'use client'

import { BookOpen, Loader2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SAMPLE_ENTRIES } from '@/lib/moods'

const MAX_LENGTH = 500

type DiaryInputProps = {
  value: string
  sampleId: string
  loading: boolean
  error: string | null
  onChange: (value: string) => void
  onSampleSelect: (sampleId: string) => void
  onSubmit: () => void
}

export function DiaryInput({ value, sampleId, loading, error, onChange, onSampleSelect, onSubmit }: DiaryInputProps) {
  const canSubmit = value.trim().length >= 3 && !loading

  return (
    <section aria-labelledby="diary-heading" className="rounded-3xl border-2 border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="diary-heading" className="flex items-center gap-2 font-display text-xl font-semibold">
          <BookOpen className="size-5 text-primary" aria-hidden="true" />
          {"How's your day going?"}
        </h2>
        <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <span className="sr-only sm:not-sr-only">Load sample</span>
          <select
            value={sampleId}
            onChange={(e) => onSampleSelect(e.target.value)}
            className="h-10 rounded-xl border-2 border-input bg-background px-3 text-sm font-semibold text-foreground focus-visible:border-primary focus-visible:outline-none"
          >
            <option value="">Load Sample Entry...</option>
            {SAMPLE_ENTRIES.map((sample, i) => (
              <option key={sample.id} value={sample.id}>
                {`${i + 1}. ${sample.label}${sample.challenging ? ' (tricky)' : ''}`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit) onSubmit()
        }}
        className="flex flex-col gap-3"
      >
        <label htmlFor="diary-entry" className="sr-only">
          Diary entry
        </label>
        <textarea
          id="diary-entry"
          value={value}
          maxLength={MAX_LENGTH}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              e.preventDefault()
              if (canSubmit) onSubmit()
            }
          }}
          rows={5}
          placeholder="Today I felt... (e.g. I have three tests this week and I can't stop worrying)"
          className="w-full resize-none rounded-2xl border-2 border-input bg-background p-4 text-base leading-relaxed placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-none"
        />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground tabular-nums">
            {value.length}/{MAX_LENGTH} characters &middot; Ctrl/Cmd + Enter to analyze
          </p>
          <Button
            type="submit"
            size="lg"
            disabled={!canSubmit}
            className="h-12 rounded-2xl px-6 font-display text-base font-semibold shadow-lg shadow-primary/25"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                Reading your vibes...
              </>
            ) : (
              <>
                <Wand2 className="size-5" aria-hidden="true" />
                Analyze Mood & Build Quest
              </>
            )}
          </Button>
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-stressed-soft px-4 py-2 text-sm font-semibold text-stressed">
            {error}
          </p>
        )}
      </form>
    </section>
  )
}

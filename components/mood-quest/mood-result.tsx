import { Award, BatteryLow, CheckCircle2, CloudLightning, Rocket, Sun, XCircle, type LucideIcon } from 'lucide-react'
import { MOODS, type AnalysisResult, type MoodId } from '@/lib/moods'
import { cn } from '@/lib/utils'

export const MOOD_ICONS: Record<MoodId, LucideIcon> = {
  stressed: CloudLightning,
  tired: BatteryLow,
  excited: Rocket,
  calm: Sun,
}

type MoodResultProps = {
  result: AnalysisResult
  expectedMood?: MoodId
}

export function MoodResult({ result, expectedMood }: MoodResultProps) {
  const mood = MOODS[result.mood]
  const Icon = MOOD_ICONS[result.mood]
  const matches = expectedMood === result.mood

  return (
    <section
      aria-labelledby="mood-heading"
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 rounded-3xl border-2 p-5 duration-500 sm:p-6',
        mood.surface,
        mood.border,
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn('flex size-16 shrink-0 items-center justify-center rounded-2xl shadow-md', mood.solid)}>
          <Icon className="size-8" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detected mood</p>
          <h2 id="mood-heading" className={cn('font-display text-2xl font-bold', mood.text)}>
            {mood.label}
          </h2>
          <p className="text-sm font-semibold text-foreground/80">{mood.tagline}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', mood.solid)}>
          <Award className="size-3.5" aria-hidden="true" />
          {mood.badge}
        </span>
        <span className="rounded-full bg-card px-3 py-1 text-xs font-bold text-foreground">
          {result.confidence}% confident
        </span>
        <span className="rounded-full bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
          {result.source === 'ai' ? 'AI analysis' : 'Keyword backup'}
        </span>
        {expectedMood && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-bold',
              matches ? 'text-calm' : 'text-stressed',
            )}
          >
            {matches ? (
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
            ) : (
              <XCircle className="size-3.5" aria-hidden="true" />
            )}
            Test: expected {MOODS[expectedMood].shortLabel}
          </span>
        )}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-card" aria-hidden="true">
        <div className={cn('h-full rounded-full transition-all duration-700', mood.bar)} style={{ width: `${result.confidence}%` }} />
      </div>

      <p className="mt-4 rounded-2xl bg-card/80 p-4 text-sm leading-relaxed">
        <span className="font-bold">Why: </span>
        {result.reasoning}
      </p>
    </section>
  )
}

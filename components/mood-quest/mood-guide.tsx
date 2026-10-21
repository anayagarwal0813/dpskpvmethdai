import { MOODS, MOOD_IDS } from '@/lib/moods'
import { cn } from '@/lib/utils'
import { MOOD_ICONS } from './mood-result'

export function MoodGuide() {
  return (
    <section aria-labelledby="guide-heading" className="rounded-3xl border-2 border-border bg-card p-5 shadow-sm">
      <h2 id="guide-heading" className="font-display text-lg font-semibold">
        The 4 Mood Zones
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {MOOD_IDS.map((id) => {
          const mood = MOODS[id]
          const Icon = MOOD_ICONS[id]
          return (
            <li key={id} className={cn('flex flex-col gap-1.5 rounded-2xl p-3', mood.surface)}>
              <Icon className={cn('size-5', mood.text)} aria-hidden="true" />
              <span className="text-xs font-bold leading-tight">{mood.label}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

import { History, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CompletedQuest } from '@/hooks/use-quest-progress'
import { MOODS } from '@/lib/moods'
import { cn } from '@/lib/utils'
import { MOOD_ICONS } from './mood-result'

type QuestHistoryProps = {
  history: CompletedQuest[]
  bestStreak: number
  onReset: () => void
}

export function QuestHistory({ history, bestStreak, onReset }: QuestHistoryProps) {
  return (
    <section aria-labelledby="history-heading" className="rounded-3xl border-2 border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 id="history-heading" className="flex items-center gap-2 font-display text-lg font-semibold">
          <History className="size-5 text-primary" aria-hidden="true" />
          Completed Quests
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
          <Trophy className="size-3.5" aria-hidden="true" />
          Best {bestStreak}
        </span>
      </div>

      {history.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-muted p-4 text-center text-sm text-muted-foreground">
          No quests yet. Finish your first one to start your streak!
        </p>
      ) : (
        <ul className="mt-4 flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
          {history.map((item) => {
            const mood = MOODS[item.mood]
            const Icon = MOOD_ICONS[item.mood]
            return (
              <li key={item.id} className={cn('flex items-center gap-3 rounded-2xl p-3', mood.surface)}>
                <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', mood.solid)}>
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="sr-only">{mood.shortLabel}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.completedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {history.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm('Reset all points, streak and quest history?')) onReset()
          }}
          className="mt-3 w-full text-muted-foreground"
        >
          Reset progress
        </Button>
      )}
    </section>
  )
}

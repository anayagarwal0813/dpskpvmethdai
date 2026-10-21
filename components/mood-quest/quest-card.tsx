'use client'

import { Check, Clock, PartyPopper, RotateCcw, Swords } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { POINTS_PER_QUEST, type ActiveQuest } from '@/hooks/use-quest-progress'
import { MOODS } from '@/lib/moods'
import { cn } from '@/lib/utils'

type QuestCardProps = {
  quest: ActiveQuest
  onToggle: (index: number) => void
  onNewQuest: () => void
}

export function QuestCard({ quest, onToggle, onNewQuest }: QuestCardProps) {
  const mood = MOODS[quest.result.mood]
  const doneCount = quest.checked.filter(Boolean).length
  const progress = Math.round((doneCount / 3) * 100)

  return (
    <section
      aria-labelledby="quest-heading"
      className="animate-in fade-in slide-in-from-bottom-2 rounded-3xl border-2 border-border bg-card p-5 shadow-sm duration-700 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Swords className={cn('size-5', mood.text)} aria-hidden="true" />
          <h2 id="quest-heading" className="font-display text-xl font-semibold text-balance">
            {quest.result.questTitle}
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-foreground">
          +{POINTS_PER_QUEST} pts
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs font-bold text-muted-foreground">
          <span>Quest progress</span>
          <span className="tabular-nums">{doneCount}/3 steps</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quest progress"
          className="h-4 overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn('h-full rounded-full transition-all duration-500 ease-out', mood.bar)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ol className="mt-5 flex flex-col gap-3">
        {quest.result.steps.map((step, i) => {
          const checked = quest.checked[i]
          return (
            <li key={i}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                disabled={quest.completed}
                onClick={() => onToggle(i)}
                className={cn(
                  'group flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default',
                  checked
                    ? cn(mood.surface, mood.border)
                    : 'border-border bg-background hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-300',
                    checked ? cn(mood.solid, 'scale-110 border-transparent') : 'border-input bg-card group-hover:border-primary/50',
                  )}
                >
                  <Check
                    className={cn('size-5 transition-all duration-300', checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0')}
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={cn('text-xs font-bold uppercase tracking-wider', mood.text)}>Step {i + 1}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <Clock className="size-3" aria-hidden="true" />
                      {step.minutes} min
                    </span>
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 block font-display text-lg font-semibold transition-colors',
                      checked && 'text-muted-foreground line-through decoration-2',
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{step.description}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      {quest.completed ? (
        <div
          role="status"
          className="mt-5 flex animate-in zoom-in-95 flex-col items-center gap-3 rounded-2xl bg-primary p-5 text-center text-primary-foreground duration-500"
        >
          <PartyPopper className="size-8" aria-hidden="true" />
          <div>
            <p className="font-display text-xl font-bold">Quest complete!</p>
            <p className="text-sm opacity-90">
              {`You earned +${POINTS_PER_QUEST} points and grew your streak. Legend!`}
            </p>
          </div>
          <Button variant="secondary" onClick={onNewQuest} className="rounded-xl font-bold">
            <RotateCcw className="size-4" aria-hidden="true" />
            Start a new quest
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onNewQuest} className="text-muted-foreground">
            Skip & write a new entry
          </Button>
        </div>
      )}
    </section>
  )
}

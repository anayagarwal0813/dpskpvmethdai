import { Flame, Sparkles, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type AppHeaderProps = {
  streak: number
  points: number
  celebrate: boolean
}

export function AppHeader({ streak, points, celebrate }: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Sparkles className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">AI Mood Quest</h1>
          <p className="text-sm text-muted-foreground">Write it. Feel it. Quest it.</p>
        </div>
      </div>

      <div className="flex items-center gap-2" aria-live="polite">
        <div
          key={`streak-${streak}`}
          className={cn(
            'flex items-center gap-2 rounded-full border-2 border-flame/30 bg-card px-4 py-2 shadow-sm',
            celebrate && 'animate-pop',
          )}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-flame text-white">
            <Flame className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-bold tabular-nums">{streak}</span>
          <span className="text-sm font-semibold text-muted-foreground">day streak</span>
        </div>
        <div
          key={`points-${points}`}
          className={cn(
            'flex items-center gap-2 rounded-full border-2 border-gold/40 bg-card px-4 py-2 shadow-sm',
            celebrate && 'animate-pop',
          )}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-gold text-foreground">
            <Star className="size-4 fill-current" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-bold tabular-nums">{points}</span>
          <span className="text-sm font-semibold text-muted-foreground">pts</span>
        </div>
      </div>
    </header>
  )
}

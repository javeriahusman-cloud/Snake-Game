import { Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MAX_LEVEL } from '@/lib/snake-engine'
import type { GameStatus } from './game-overlay'

type GameHudProps = {
  score: number
  best: number
  level: number
  progress: number
  speedMs: number
  status: GameStatus
  onTogglePause: () => void
}

export function GameHud({ score, best, level, progress, speedMs, status, onTogglePause }: GameHudProps) {
  const atMax = level >= MAX_LEVEL
  const canToggle = status === 'running' || status === 'paused'

  return (
    <section aria-label="Game stats" className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Score" value={score} highlight />
        <Stat label="Best" value={best} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Level</span>
          <span className="font-mono text-sm tabular-nums text-muted-foreground">
            {Math.round(1000 / speedMs)} moves/s
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-bold tabular-nums">
            {level}
            <span className="text-base text-muted-foreground">/{MAX_LEVEL}</span>
          </span>
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Progress to next level"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={atMax ? 100 : Math.round(progress * 100)}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${atMax ? 100 : progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      <Button variant="secondary" onClick={onTogglePause} disabled={!canToggle} className="gap-2">
        {status === 'paused' ? (
          <>
            <Play className="size-4" aria-hidden="true" /> Resume
          </>
        ) : (
          <>
            <Pause className="size-4" aria-hidden="true" /> Pause
          </>
        )}
      </Button>
    </section>
  )
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <span
        key={value}
        className={
          highlight
            ? 'font-mono text-3xl font-bold tabular-nums text-primary animate-in zoom-in-110 duration-200'
            : 'font-mono text-3xl font-bold tabular-nums'
        }
      >
        {value}
      </span>
    </div>
  )
}

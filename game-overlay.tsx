import { Play, RotateCcw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type GameStatus = 'idle' | 'running' | 'paused' | 'over'

type GameOverlayProps = {
  status: GameStatus
  score: number
  best: number
  level: number
  isNewBest: boolean
  onStart: () => void
  onResume: () => void
}

export function GameOverlay({ status, score, best, level, isNewBest, onStart, onResume }: GameOverlayProps) {
  if (status === 'running') return null

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center bg-background/60 p-6 backdrop-blur-[2px]',
        'animate-in fade-in duration-300',
      )}
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-5 text-center animate-in zoom-in-95 duration-300">
        {status === 'idle' && (
          <>
            <div className="flex flex-col gap-2">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Arcade classic</p>
              <h2 className="text-balance text-5xl font-bold tracking-tight">Snake</h2>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                Eat the glowing food to grow. Every {5} bites you level up and move faster. Avoid walls and your
                own tail.
              </p>
            </div>
            <Button size="lg" onClick={onStart} className="w-full gap-2">
              <Play className="size-4" aria-hidden="true" />
              Start game
            </Button>
            <p className="font-mono text-xs text-muted-foreground">Press any arrow key or Space</p>
          </>
        )}

        {status === 'paused' && (
          <>
            <h2 className="text-4xl font-bold tracking-tight">Paused</h2>
            <Button size="lg" onClick={onResume} className="w-full gap-2">
              <Play className="size-4" aria-hidden="true" />
              Resume
            </Button>
            <p className="font-mono text-xs text-muted-foreground">Press P, Space, or an arrow key</p>
          </>
        )}

        {status === 'over' && (
          <>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Game over</p>
              <p className="font-mono text-6xl font-bold tabular-nums">{score}</p>
              <p className="text-sm text-muted-foreground">Reached level {level}</p>
            </div>
            {isNewBest ? (
              <p className="flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
                <Trophy className="size-4" aria-hidden="true" />
                New best score!
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Best: <span className="font-mono tabular-nums text-foreground">{best}</span>
              </p>
            )}
            <Button size="lg" onClick={onStart} className="w-full gap-2" autoFocus>
              <RotateCcw className="size-4" aria-hidden="true" />
              Play again
            </Button>
            <p className="font-mono text-xs text-muted-foreground">Press Enter, Space, or R</p>
          </>
        )}
      </div>
    </div>
  )
}

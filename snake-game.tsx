'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FOOD_PER_LEVEL,
  OPPOSITE,
  createInitialState,
  step,
  tickMsForLevel,
  type Direction,
  type GameState,
} from '@/lib/snake-engine'
import { burst, createEffects, drawGame, updateParticles } from '@/lib/snake-render'
import { GameHud } from './game-hud'
import { GameOverlay, type GameStatus } from './game-overlay'
import { TouchControls } from './touch-controls'
import { ControlsLegend } from './controls-legend'

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const sizeRef = useRef(0)
  const gameRef = useRef<GameState>(createInitialState())
  const directionQueueRef = useRef<Direction[]>([])
  const statusRef = useRef<GameStatus>('idle')
  const accumulatorRef = useRef(0)
  const fxRef = useRef(createEffects())
  const bestRef = useRef(0)

  const [status, setStatus] = useState<GameStatus>('idle')
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [eaten, setEaten] = useState(0)
  const [best, setBest] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)

  const updateStatus = useCallback((next: GameStatus) => {
    statusRef.current = next
    setStatus(next)
  }, [])

  const startGame = useCallback(
    (initialDirection?: Direction) => {
      const fresh = createInitialState()
      gameRef.current = fresh
      directionQueueRef.current =
        initialDirection && initialDirection !== OPPOSITE[fresh.direction] && initialDirection !== fresh.direction
          ? [initialDirection]
          : []
      accumulatorRef.current = 0
      fxRef.current = createEffects()
      setScore(0)
      setLevel(1)
      setEaten(0)
      setIsNewBest(false)
      updateStatus('running')
    },
    [updateStatus],
  )

  const togglePause = useCallback(() => {
    if (statusRef.current === 'running') updateStatus('paused')
    else if (statusRef.current === 'paused') updateStatus('running')
  }, [updateStatus])

  const handleDirection = useCallback(
    (dir: Direction) => {
      const current = statusRef.current
      if (current === 'idle') {
        startGame(dir)
        return
      }
      if (current === 'paused') updateStatus('running')
      if (current === 'over') return

      const queue = directionQueueRef.current
      const last = queue[queue.length - 1] ?? gameRef.current.direction
      if (dir === last || dir === OPPOSITE[last]) return
      if (queue.length < 3) queue.push(dir)
    },
    [startGame, updateStatus],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const dir = KEY_TO_DIRECTION[event.key] ?? KEY_TO_DIRECTION[event.key.toLowerCase()]
      if (dir) {
        event.preventDefault()
        handleDirection(dir)
        return
      }
      const key = event.key.toLowerCase()
      if (key === ' ' || key === 'enter') {
        event.preventDefault()
        if (statusRef.current === 'idle' || statusRef.current === 'over') startGame()
        else togglePause()
      } else if (key === 'p' || key === 'escape') {
        togglePause()
      } else if (key === 'r' && statusRef.current === 'over') {
        startGame()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleDirection, startGame, togglePause])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && statusRef.current === 'running') updateStatus('paused')
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [updateStatus])

  useEffect(() => {
    const board = boardRef.current
    const canvas = canvasRef.current
    if (!board || !canvas) return
    const observer = new ResizeObserver(([entry]) => {
      const size = Math.floor(entry.contentRect.width)
      const dpr = window.devicePixelRatio || 1
      sizeRef.current = size
      canvas.width = size * dpr
      canvas.height = size * dpr
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)
    })
    observer.observe(board)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    let frame = 0
    let last = performance.now()

    const loop = (now: number) => {
      const dt = Math.min(now - last, 100)
      last = now
      const fx = fxRef.current

      if (statusRef.current === 'running') {
        accumulatorRef.current += dt
        while (accumulatorRef.current >= tickMsForLevel(gameRef.current.level)) {
          accumulatorRef.current -= tickMsForLevel(gameRef.current.level)
          const result = step(gameRef.current, directionQueueRef.current.shift())

          if (result.event === 'died') {
            const finalScore = gameRef.current.score
            accumulatorRef.current = 0
            fx.shakeUntil = now + 400
            if (finalScore > bestRef.current) {
              bestRef.current = finalScore
              setBest(finalScore)
              setIsNewBest(finalScore > 0)
            }
            updateStatus('over')
            break
          }

          gameRef.current = result.state
          if (result.eatenAt) {
            burst(fx, result.eatenAt)
            setScore(result.state.score)
            setEaten(result.state.eaten)
          }
          if (result.event === 'levelup') {
            setLevel(result.state.level)
            fx.levelFlashUntil = now + 1200
            fx.levelFlashValue = result.state.level
          }
        }
      }

      updateParticles(fx, dt)

      const size = sizeRef.current
      if (size > 0) {
        const current = statusRef.current
        const t =
          current === 'over' || current === 'idle'
            ? 1
            : Math.min(1, accumulatorRef.current / tickMsForLevel(gameRef.current.level))
        drawGame(ctx, { state: gameRef.current, t, size, now, fx, dead: current === 'over' })
      }

      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [updateStatus])

  return (
    <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex w-full flex-col gap-4 lg:max-w-[min(640px,calc(100vh-10rem))]">
        <div
          ref={boardRef}
          className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/40"
        >
          <canvas
            ref={canvasRef}
            className="block"
            role="img"
            aria-label={`Snake game board. Score ${score}, level ${level}.`}
          />
          <GameOverlay
            status={status}
            score={score}
            best={best}
            level={level}
            isNewBest={isNewBest}
            onStart={() => startGame()}
            onResume={togglePause}
          />
        </div>
        <TouchControls onDirection={handleDirection} />
      </div>

      <aside className="flex w-full flex-col gap-4 lg:w-72">
        <GameHud
          score={score}
          best={best}
          level={level}
          progress={(eaten % FOOD_PER_LEVEL) / FOOD_PER_LEVEL}
          speedMs={tickMsForLevel(level)}
          status={status}
          onTogglePause={togglePause}
        />
        <ControlsLegend />
      </aside>
      <p className="sr-only" aria-live="polite">
        {status === 'over' ? `Game over. Final score ${score}.` : `Level ${level}`}
      </p>
    </div>
  )
}

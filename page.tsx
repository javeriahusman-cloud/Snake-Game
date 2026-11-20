import { SnakeGame } from '@/components/snake/snake-game'

export default function Page() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="size-3 rounded-full bg-primary shadow-[0_0_12px] shadow-primary" aria-hidden="true" />
          Snake
        </h1>
        <p className="font-mono text-xs text-muted-foreground">Eat · Grow · Survive</p>
      </header>
      <SnakeGame />
    </main>
  )
}

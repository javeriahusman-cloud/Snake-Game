import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'

function Key({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <kbd
      aria-label={label}
      className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-border border-b-2 bg-secondary px-2 font-mono text-xs text-foreground"
    >
      {children}
    </kbd>
  )
}

export function ControlsLegend() {
  return (
    <section aria-label="Controls" className="hidden flex-col gap-4 rounded-2xl border border-border bg-card p-5 md:flex">
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Controls</h2>
      <div className="flex items-center justify-between gap-4">
        <div className="grid grid-cols-3 gap-1">
          <span className="col-start-2">
            <Key label="Arrow up">
              <ArrowUp className="size-3.5" aria-hidden="true" />
            </Key>
          </span>
          <span className="col-start-1 row-start-2">
            <Key label="Arrow left">
              <ArrowLeft className="size-3.5" aria-hidden="true" />
            </Key>
          </span>
          <span className="col-start-2 row-start-2">
            <Key label="Arrow down">
              <ArrowDown className="size-3.5" aria-hidden="true" />
            </Key>
          </span>
          <span className="col-start-3 row-start-2">
            <Key label="Arrow right">
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Key>
          </span>
        </div>
        <span className="text-sm text-muted-foreground">Steer</span>
      </div>
      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Start / Pause</dt>
          <dd>
            <Key>Space</Key>
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Pause</dt>
          <dd>
            <Key>P</Key>
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Restart</dt>
          <dd className="flex gap-1">
            <Key>Enter</Key>
            <Key>R</Key>
          </dd>
        </div>
      </dl>
    </section>
  )
}

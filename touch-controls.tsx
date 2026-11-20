import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, type LucideIcon } from 'lucide-react'
import type { Direction } from '@/lib/snake-engine'

const BUTTONS: { dir: Direction; icon: LucideIcon; label: string; area: string }[] = [
  { dir: 'up', icon: ChevronUp, label: 'Move up', area: 'col-start-2 row-start-1' },
  { dir: 'left', icon: ChevronLeft, label: 'Move left', area: 'col-start-1 row-start-2' },
  { dir: 'down', icon: ChevronDown, label: 'Move down', area: 'col-start-2 row-start-2' },
  { dir: 'right', icon: ChevronRight, label: 'Move right', area: 'col-start-3 row-start-2' },
]

export function TouchControls({ onDirection }: { onDirection: (dir: Direction) => void }) {
  return (
    <div className="mx-auto grid grid-cols-3 grid-rows-2 gap-2 md:hidden">
      {BUTTONS.map(({ dir, icon: Icon, label, area }) => (
        <button
          key={dir}
          type="button"
          aria-label={label}
          onPointerDown={(e) => {
            e.preventDefault()
            onDirection(dir)
          }}
          className={`${area} flex size-16 touch-none select-none items-center justify-center rounded-xl border border-border bg-card text-foreground active:scale-95 active:bg-secondary transition-transform`}
        >
          <Icon className="size-7" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

import { GRID_SIZE, VECTORS, interpolatedPath, type GameState, type Point } from './snake-engine'

export const PALETTE = {
  board: '#131d16',
  cellAlt: '#172219',
  snakeHead: '#c6f25a',
  snakeTail: '#3f7a1c',
  deadHead: '#f07a5c',
  deadTail: '#6b2a1f',
  food: '#ff7a59',
  eye: '#0f1611',
  text: '#eef5e4',
}

export type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

export type Effects = {
  particles: Particle[]
  shakeUntil: number
  levelFlashUntil: number
  levelFlashValue: number
}

export function createEffects(): Effects {
  return { particles: [], shakeUntil: 0, levelFlashUntil: 0, levelFlashValue: 1 }
}

export function burst(fx: Effects, at: Point, count = 14) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
    const speed = 2 + Math.random() * 4
    const maxLife = 350 + Math.random() * 250
    fx.particles.push({
      x: at.x + 0.5,
      y: at.y + 0.5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: maxLife,
      maxLife,
      size: 0.08 + Math.random() * 0.1,
    })
  }
}

export function updateParticles(fx: Effects, dtMs: number) {
  const dt = dtMs / 1000
  fx.particles = fx.particles.filter((p) => {
    p.life -= dtMs
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vx *= 0.92
    p.vy *= 0.92
    return p.life > 0
  })
}

type DrawOptions = {
  state: GameState
  t: number
  size: number
  now: number
  fx: Effects
  dead: boolean
}

export function drawGame(ctx: CanvasRenderingContext2D, { state, t, size, now, fx, dead }: DrawOptions) {
  const cell = size / GRID_SIZE
  ctx.clearRect(0, 0, size, size)
  ctx.save()

  if (now < fx.shakeUntil) {
    const strength = ((fx.shakeUntil - now) / 400) * cell * 0.35
    ctx.translate((Math.random() - 0.5) * strength, (Math.random() - 0.5) * strength)
  }

  ctx.fillStyle = PALETTE.board
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = PALETTE.cellAlt
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = (y % 2); x < GRID_SIZE; x += 2) {
      ctx.fillRect(x * cell, y * cell, cell, cell)
    }
  }

  if (state.food.x >= 0) {
    const pulse = 1 + Math.sin(now / 170) * 0.1
    const fx0 = (state.food.x + 0.5) * cell
    const fy0 = (state.food.y + 0.5) * cell
    ctx.save()
    ctx.shadowColor = PALETTE.food
    ctx.shadowBlur = cell * 0.9
    ctx.fillStyle = PALETTE.food
    ctx.beginPath()
    ctx.arc(fx0, fy0, cell * 0.3 * pulse, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.beginPath()
    ctx.arc(fx0 - cell * 0.09, fy0 - cell * 0.09, cell * 0.07, 0, Math.PI * 2)
    ctx.fill()
  }

  const path = interpolatedPath(state, t).map((p) => ({ x: (p.x + 0.5) * cell, y: (p.y + 0.5) * cell }))
  const head = path[0]
  const tail = path[path.length - 1]
  const headColor = dead ? PALETTE.deadHead : PALETTE.snakeHead
  const tailColor = dead ? PALETTE.deadTail : PALETTE.snakeTail

  const gradient = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y)
  gradient.addColorStop(0, headColor)
  gradient.addColorStop(1, tailColor)

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = cell * 0.72
  ctx.strokeStyle = gradient
  if (!dead) {
    ctx.shadowColor = 'rgba(198, 242, 90, 0.35)'
    ctx.shadowBlur = cell * 0.5
  }
  ctx.beginPath()
  ctx.moveTo(head.x, head.y)
  for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y)
  ctx.stroke()
  ctx.restore()

  ctx.fillStyle = headColor
  ctx.beginPath()
  ctx.arc(head.x, head.y, cell * 0.42, 0, Math.PI * 2)
  ctx.fill()

  const dir = VECTORS[state.direction]
  const side = { x: -dir.y, y: dir.x }
  const forward = cell * 0.14
  const spread = cell * 0.17
  ctx.fillStyle = PALETTE.eye
  for (const s of [-1, 1]) {
    const ex = head.x + dir.x * forward + side.x * spread * s
    const ey = head.y + dir.y * forward + side.y * spread * s
    ctx.beginPath()
    if (dead) {
      const r = cell * 0.07
      ctx.lineWidth = cell * 0.05
      ctx.strokeStyle = PALETTE.eye
      ctx.moveTo(ex - r, ey - r)
      ctx.lineTo(ex + r, ey + r)
      ctx.moveTo(ex + r, ey - r)
      ctx.lineTo(ex - r, ey + r)
      ctx.stroke()
    } else {
      ctx.arc(ex, ey, cell * 0.075, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  for (const p of fx.particles) {
    const alpha = p.life / p.maxLife
    ctx.globalAlpha = alpha
    ctx.fillStyle = PALETTE.food
    ctx.beginPath()
    ctx.arc(p.x * cell, p.y * cell, p.size * cell * alpha + 1, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  if (now < fx.levelFlashUntil) {
    const remaining = (fx.levelFlashUntil - now) / 1200
    const scale = 1 + (1 - remaining) * 0.15
    ctx.save()
    ctx.globalAlpha = Math.min(1, remaining * 2)
    ctx.translate(size / 2, size / 2)
    ctx.scale(scale, scale)
    ctx.fillStyle = PALETTE.text
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `700 ${cell * 1.6}px ui-monospace, monospace`
    ctx.fillText(`LEVEL ${fx.levelFlashValue}`, 0, 0)
    ctx.restore()
  }

  ctx.restore()
}

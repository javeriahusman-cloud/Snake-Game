export type Point = { x: number; y: number }
export type Direction = 'up' | 'down' | 'left' | 'right'

export const GRID_SIZE = 20
export const FOOD_PER_LEVEL = 5
export const MAX_LEVEL = 10

export const VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

export const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

export type GameState = {
  snake: Point[]
  prevSnake: Point[]
  direction: Direction
  food: Point
  score: number
  level: number
  eaten: number
}

export type StepEvent = 'moved' | 'ate' | 'levelup' | 'died'

export type StepResult = {
  state: GameState
  event: StepEvent
  eatenAt?: Point
}

export function tickMsForLevel(level: number) {
  return Math.max(55, 150 - (level - 1) * 10)
}

const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y

export function spawnFood(snake: Point[]): Point {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`))
  const free: Point[] = []
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y })
    }
  }
  if (free.length === 0) return { x: -1, y: -1 }
  return free[Math.floor(Math.random() * free.length)]
}

export function createInitialState(): GameState {
  const mid = Math.floor(GRID_SIZE / 2)
  const snake = [
    { x: 6, y: mid },
    { x: 5, y: mid },
    { x: 4, y: mid },
  ]
  return {
    snake,
    prevSnake: snake,
    direction: 'right',
    food: spawnFood(snake),
    score: 0,
    level: 1,
    eaten: 0,
  }
}

export function step(state: GameState, requested?: Direction): StepResult {
  const direction = requested ?? state.direction
  const head = state.snake[0]
  const vector = VECTORS[direction]
  const next = { x: head.x + vector.x, y: head.y + vector.y }

  const willEat = samePoint(next, state.food)
  const body = willEat ? state.snake : state.snake.slice(0, -1)

  const hitWall = next.x < 0 || next.y < 0 || next.x >= GRID_SIZE || next.y >= GRID_SIZE
  const hitSelf = body.some((p) => samePoint(p, next))
  if (hitWall || hitSelf) return { state, event: 'died' }

  const snake = [next, ...body]

  if (!willEat) {
    return {
      state: { ...state, prevSnake: state.snake, snake, direction },
      event: 'moved',
    }
  }

  const eaten = state.eaten + 1
  const level = Math.min(MAX_LEVEL, 1 + Math.floor(eaten / FOOD_PER_LEVEL))

  return {
    state: {
      ...state,
      prevSnake: state.snake,
      snake,
      direction,
      food: spawnFood(snake),
      score: state.score + 10 * state.level,
      level,
      eaten,
    },
    event: level > state.level ? 'levelup' : 'ate',
    eatenAt: next,
  }
}

/** Path of the snake between two ticks; corners stay on grid centres so turns never cut diagonally. */
export function interpolatedPath(state: GameState, t: number): Point[] {
  const { snake, prevSnake } = state
  const lerp = (a: Point, b: Point): Point => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  })
  const head = lerp(prevSnake[0], snake[0])
  const tail = lerp(prevSnake[prevSnake.length - 1], snake[snake.length - 1])
  return [head, ...snake.slice(1), tail]
}

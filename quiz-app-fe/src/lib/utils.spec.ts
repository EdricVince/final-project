import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn (class merge)', () => {
  it('joins class names', () => {
    expect(cn('p-2', 'text-sm')).toBe('p-2 text-sm')
  })

  it('lets a later Tailwind class win a conflict (tailwind-merge)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('drops falsy values and flattens arrays (clsx)', () => {
    expect(cn('a', false, undefined, null, 'c')).toBe('a c')
    expect(cn(['x', 'y'], { z: true, hidden: false })).toBe('x y z')
  })
})

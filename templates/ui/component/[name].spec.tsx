import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { [name] } from './[name]'

describe('[name]', () => {
  it('renders without crashing', () => {
    render(<[name] />)
    // Add your test assertions here
  })

  it('applies custom className', () => {
    const customClass = 'custom-class'
    render(<[name] className={customClass} />)
    expect(screen.getByRole('generic')).toHaveClass(customClass)
  })

  // Add more test cases here
})

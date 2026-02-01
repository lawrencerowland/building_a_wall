import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders template heading', () => {
  render(<App />)
  const heading = screen.getByText(/React App Template/i)
  expect(heading).toBeDefined()
})

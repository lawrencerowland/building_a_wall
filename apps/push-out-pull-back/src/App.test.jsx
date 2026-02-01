import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App';

test('renders heading', () => {
  render(<App />);
  const heading = screen.getByText(/Category Theory: Interactive Comparison/i);
  expect(heading).toBeDefined();
});

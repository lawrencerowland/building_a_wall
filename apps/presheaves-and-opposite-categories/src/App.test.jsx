import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App.jsx';

test('renders heading', () => {
  render(<App />);
  const heading = screen.getByText(/Presheaf Visualization/i);
  expect(heading).toBeDefined();
});

test('shows push forward button', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /Try Push Forward/i });
  expect(button).toBeDefined();
});

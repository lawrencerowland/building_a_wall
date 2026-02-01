import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App';

test('renders currying heading', () => {
  render(<App />);
  const heading = screen.getByText(/Currying Demonstration/i);
  expect(heading).toBeDefined();
});

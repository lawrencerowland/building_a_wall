import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App';

test('renders heading', () => {
  render(<App />);
  const heading = screen.getByText(/Design to Implementation Mapping/i);
  expect(heading).toBeDefined();
});

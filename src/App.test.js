import { render, screen } from '@testing-library/react';
import App from './App';

test('renders job tracker interface', () => {
  render(<App />);
  expect(screen.getByText(/סדר נעים וקליל לחיפוש העבודה שלך/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /הוספת משרה/i })).toBeInTheDocument();
});

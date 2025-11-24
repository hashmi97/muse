import { cleanup, render, screen } from '@testing-library/react';
import App from '../../App';

afterEach(() => cleanup());

describe('App routing', () => {
  it('renders landing by default', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(screen.getByText(/start planning/i)).toBeInTheDocument();
  });

  it('navigates to dashboard route', () => {
    window.history.pushState({}, '', '/dashboard');
    render(<App />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotFound from '../pages/NotFound';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/use-theme';

describe('NotFound Component', () => {
  it('renders the 404 text', () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      </ThemeProvider>
    );

    // Assuming the NotFound page has "404" text somewhere
    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });
});

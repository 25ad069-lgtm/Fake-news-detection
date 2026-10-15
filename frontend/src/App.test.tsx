import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('TruthLens AI app', () => {
  it('renders the home page hero text', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Question the News. Discover the Evidence./i)).toBeInTheDocument();
  });

  it('renders the analysis page heading', () => {
    render(
      <MemoryRouter initialEntries={['/analyze']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Submit content for a credibility estimate./i)).toBeInTheDocument();
  });
});

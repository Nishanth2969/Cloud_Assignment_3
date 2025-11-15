import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders the main application', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.App')).toBeInTheDocument();
  });

  test('renders header with title', () => {
    render(<App />);
    const headerElements = screen.getAllByText(/Smart Photo Album/i);
    expect(headerElements.length).toBeGreaterThan(0);
  });

  test('renders search section', () => {
    render(<App />);
    const searchElement = screen.getByText(/Search Photos/i);
    expect(searchElement).toBeInTheDocument();
  });

  test('renders upload section', () => {
    render(<App />);
    const uploadElement = screen.getByText(/Upload New Photo/i);
    expect(uploadElement).toBeInTheDocument();
  });

  test('renders footer', () => {
    render(<App />);
    const footerElement = screen.getByText(/Cloud Computing and Big Data Systems/i);
    expect(footerElement).toBeInTheDocument();
  });
});

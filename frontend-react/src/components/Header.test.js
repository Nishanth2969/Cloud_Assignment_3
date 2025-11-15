import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header Component', () => {
  test('renders header title', () => {
    render(<Header />);
    const titleElement = screen.getByText(/Smart Photo Album/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders header subtitle', () => {
    render(<Header />);
    const subtitleElement = screen.getByText(/Search your photos using natural language/i);
    expect(subtitleElement).toBeInTheDocument();
  });

  test('has correct CSS classes', () => {
    const { container } = render(<Header />);
    expect(container.querySelector('.app-header')).toBeInTheDocument();
    expect(container.querySelector('.header-content')).toBeInTheDocument();
  });
});


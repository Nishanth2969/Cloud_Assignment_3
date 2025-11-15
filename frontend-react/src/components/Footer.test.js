import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer Component', () => {
  test('renders footer text', () => {
    render(<Footer />);
    
    const footerText = screen.getByText(/Cloud Computing and Big Data Systems/i);
    expect(footerText).toBeInTheDocument();
  });

  test('renders assignment information', () => {
    render(<Footer />);
    
    const assignmentText = screen.getByText(/Assignment 3: Smart Photo Album/i);
    expect(assignmentText).toBeInTheDocument();
  });

  test('has correct CSS class', () => {
    const { container } = render(<Footer />);
    
    expect(container.querySelector('.app-footer')).toBeInTheDocument();
  });
});


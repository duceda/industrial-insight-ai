import { render, screen } from '@testing-library/react'
import React from 'react'
import App from '../App'

test('renders header and backend status placeholder', () => {
  render(<App />)
  expect(screen.getByText(/InduSight AI/i)).toBeInTheDocument()
  expect(screen.getByText(/Backend:/i)).toBeInTheDocument()
})

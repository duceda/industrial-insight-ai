import { render, screen } from '@testing-library/react'
import Dashboard from '../pages/Dashboard'
import React from 'react'

test('renders dashboard KPI', () => {
  render(<Dashboard />)
  expect(screen.getByText(/Total Machines/i)).toBeInTheDocument()
})

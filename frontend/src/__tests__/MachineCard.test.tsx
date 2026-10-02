import { render, screen } from '@testing-library/react'
import React from 'react'
import MachineCard from '../components/MachineCard'

test('renders machine card', () => {
  render(<MachineCard id="M-1" prob={0.12} status="healthy" updated={new Date().toISOString()} />)
  expect(screen.getByText(/M-1/)).toBeInTheDocument()
})

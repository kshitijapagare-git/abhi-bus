import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SearchCard from './SearchCard'

describe('SearchCard', () => {
  it('filters and selects a city suggestion for the From field', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    fireEvent.change(fromInput, { target: { value: 'pu' } })

    const puneOption = screen.getAllByRole('option').find((o) => o.textContent?.includes('Pune'))!
    fireEvent.mouseDown(puneOption)

    expect(fromInput).toHaveValue('Pune')
  })

  it('shows a required-field error for each unselected field on Search', () => {
    render(<SearchCard />)
    fireEvent.click(screen.getByRole('button', { name: /search buses/i }))

    const errors = screen.getAllByText('Please select a valid city')
    expect(errors).toHaveLength(2)
  })

  it('shows a duplicate-city error next to both fields when From and To match', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    fireEvent.change(fromInput, { target: { value: 'pu' } })
    fireEvent.mouseDown(screen.getAllByRole('option').find((o) => o.textContent?.includes('Pune'))!)

    fireEvent.change(toInput, { target: { value: 'pu' } })
    fireEvent.mouseDown(screen.getAllByRole('option').find((o) => o.textContent?.includes('Pune'))!)

    fireEvent.click(screen.getByRole('button', { name: /search buses/i }))

    const errors = screen.getAllByText('From and To cannot be the same')
    expect(errors).toHaveLength(2)
  })

  it('swaps the selected cities and their displayed text', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    fireEvent.change(fromInput, { target: { value: 'pu' } })
    fireEvent.mouseDown(screen.getAllByRole('option').find((o) => o.textContent?.includes('Pune'))!)

    fireEvent.change(toInput, { target: { value: 'ben' } })
    fireEvent.mouseDown(screen.getAllByRole('option').find((o) => o.textContent?.includes('Bengaluru'))!)

    fireEvent.click(screen.getByRole('button', { name: 'Swap From and To' }))

    expect(fromInput).toHaveValue('Bengaluru')
    expect(toInput).toHaveValue('Pune')
  })

  it('closes any open suggestion list when swap is clicked', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    fireEvent.change(fromInput, { target: { value: 'pu' } })
    expect(screen.getAllByRole('listbox').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Swap From and To' }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})

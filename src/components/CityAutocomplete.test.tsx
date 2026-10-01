import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CityAutocomplete from './CityAutocomplete'
import type { City } from '../types'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
  { id: 3, name: 'Puducherry', state: 'Puducherry' },
  { id: 4, name: 'Punjab Town', state: 'Punjab' },
  { id: 5, name: 'Puri', state: 'Odisha' },
  { id: 6, name: 'Pushkar', state: 'Rajasthan' },
  { id: 7, name: 'Purnia', state: 'Bihar' },
]

interface HarnessProps {
  closeSignal?: number
  onSelectCity?: (cityId: number | null, cityName: string) => void
}

function Harness({ closeSignal, onSelectCity }: HarnessProps) {
  const [value, setValue] = useState('')
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)

  return (
    <CityAutocomplete
      id="from"
      ariaLabel="From"
      cities={cities}
      value={value}
      onValueChange={setValue}
      selectedCityId={selectedCityId}
      onSelectCity={(id, name) => {
        setSelectedCityId(id)
        onSelectCity?.(id, name)
      }}
      closeSignal={closeSignal}
    />
  )
}

describe('CityAutocomplete', () => {
  it('shows no listbox for an empty input', () => {
    render(<Harness />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('requires at least one character before showing suggestions', () => {
    render(<Harness />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: '' } })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('filters cities by name, showing state as secondary text', () => {
    render(<Harness />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })
    const options = screen.getAllByRole('option')
    const puneOption = options.find((o) => o.textContent?.includes('Pune'))
    expect(puneOption).toBeDefined()
    expect(puneOption).toHaveTextContent('Maharashtra')
  })

  it('caps results to the first 6 matches', () => {
    render(<Harness />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })
    const options = screen.getAllByRole('option')
    expect(options.length).toBeLessThanOrEqual(6)
  })

  it('wraps active index with ArrowDown and ArrowUp, and wires aria-activedescendant', () => {
    render(<Harness />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })
    const options = screen.getAllByRole('option')
    const count = options.length

    expect(input).toHaveAttribute('aria-controls')
    const listbox = screen.getByRole('listbox')
    expect(input.getAttribute('aria-controls')).toBe(listbox.id)

    for (let i = 0; i < count; i++) {
      fireEvent.keyDown(input, { key: 'ArrowDown' })
    }
    // After `count` ArrowDown presses starting from -1, active index wraps back to 0
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id)

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input.getAttribute('aria-activedescendant')).toBe(options[count - 1].id)
  })

  it('selects the highlighted option on Enter, calling onSelectCity and updating the value', () => {
    const onSelectCity = vi.fn()
    render(<Harness onSelectCity={onSelectCity} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    const activeId = input.getAttribute('aria-activedescendant')
    const activeOption = screen.getAllByRole('option').find((o) => o.id === activeId)!
    const expectedCity = cities.find((c) => activeOption.textContent?.includes(c.name))!

    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelectCity).toHaveBeenCalledWith(expectedCity.id, expectedCity.name)
    expect(screen.getByRole('combobox')).toHaveValue(expectedCity.name)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('typing "pu" and selecting Pune stores cityId 1', () => {
    const onSelectCity = vi.fn()
    render(<Harness onSelectCity={onSelectCity} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })

    const puneOption = screen.getAllByRole('option').find((o) => o.textContent?.includes('Pune'))!
    fireEvent.mouseDown(puneOption)

    expect(onSelectCity).toHaveBeenCalledWith(1, 'Pune')
    expect(input).toHaveValue('Pune')
  })

  it('closes the listbox on Escape without changing the input text or selection', () => {
    const onSelectCity = vi.fn()
    render(<Harness onSelectCity={onSelectCity} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveValue('pu')
  })

  it('force-closes the listbox when closeSignal changes', () => {
    const { rerender } = render(<Harness closeSignal={0} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    rerender(<Harness closeSignal={1} />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})

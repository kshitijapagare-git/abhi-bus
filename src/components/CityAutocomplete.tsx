import { useEffect, useMemo, useState } from 'react'
import type { City } from '../types'

export interface CityAutocompleteProps {
  id: string
  ariaLabel: string
  cities: City[]
  value: string
  onValueChange: (value: string) => void
  selectedCityId: number | null
  onSelectCity: (cityId: number | null, cityName: string) => void
  error?: string
  closeSignal?: number
}

const MAX_RESULTS = 6

function CityAutocomplete({
  id,
  ariaLabel,
  cities,
  value,
  onValueChange,
  onSelectCity,
  error,
  closeSignal,
}: CityAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const listboxId = `${id}-listbox`

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase()
    if (query.length < 1) return []
    return cities.filter((c) => c.name.toLowerCase().includes(query)).slice(0, MAX_RESULTS)
  }, [cities, value])

  useEffect(() => {
    setOpen(false)
    setActiveIndex(-1)
  }, [closeSignal])

  useEffect(() => {
    if (matches.length === 0) {
      setOpen(false)
      setActiveIndex(-1)
    }
  }, [matches.length])

  const activeOptionId =
    open && activeIndex >= 0 && activeIndex < matches.length ? `${id}-option-${matches[activeIndex].id}` : undefined

  const handleChange = (text: string) => {
    onValueChange(text)
    onSelectCity(null, text)
    setOpen(text.trim().length >= 1)
    setActiveIndex(-1)
  }

  const selectOption = (city: City) => {
    onSelectCity(city.id, city.name)
    onValueChange(city.name)
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open && matches.length > 0) {
        setOpen(true)
        setActiveIndex(0)
        return
      }
      if (matches.length === 0) return
      setActiveIndex((prev) => (prev + 1 >= matches.length ? 0 : prev + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open && matches.length > 0) {
        setOpen(true)
        setActiveIndex(matches.length - 1)
        return
      }
      if (matches.length === 0) return
      setActiveIndex((prev) => (prev - 1 < 0 ? matches.length - 1 : prev - 1))
    } else if (e.key === 'Enter') {
      if (open && activeIndex >= 0 && activeIndex < matches.length) {
        e.preventDefault()
        selectOption(matches[activeIndex])
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        setOpen(false)
        setActiveIndex(-1)
      }
    }
  }

  return (
    <div className="city-autocomplete">
      <input
        id={id}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        autoComplete="off"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (value.trim().length >= 1 && matches.length > 0) setOpen(true)
        }}
      />
      {open && matches.length > 0 && (
        <ul id={listboxId} role="listbox" className="city-autocomplete-list">
          {matches.map((city, index) => (
            <li
              key={city.id}
              id={`${id}-option-${city.id}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`city-option ${index === activeIndex ? 'city-option-active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                selectOption(city)
              }}
            >
              <span className="city-option-name">{city.name}</span>
              <span className="city-option-state">{city.state}</span>
            </li>
          ))}
        </ul>
      )}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export default CityAutocomplete

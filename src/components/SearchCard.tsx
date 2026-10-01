import { useState } from 'react'
import CityAutocomplete from './CityAutocomplete'
import { cities } from '../data'

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}, ${d.getFullYear()}`

function SearchCard() {
  const [today] = useState(() => new Date())
  const [dayOffset, setDayOffset] = useState(0)
  const [forWomen, setForWomen] = useState(false)

  const [fromText, setFromText] = useState('')
  const [fromCityId, setFromCityId] = useState<number | null>(null)
  const [toText, setToText] = useState('')
  const [toCityId, setToCityId] = useState<number | null>(null)
  const [fromError, setFromError] = useState<string | undefined>(undefined)
  const [toError, setToError] = useState<string | undefined>(undefined)
  const [closeSignal, setCloseSignal] = useState(0)

  const date = new Date(today)
  date.setDate(today.getDate() + dayOffset)

  const getCityName = (cityId: number | null) => {
    if (cityId === null) return ''
    return cities.find((c) => c.id === cityId)?.name ?? ''
  }

  const handleSwap = () => {
    const newFromCityId = toCityId
    const newToCityId = fromCityId
    setFromCityId(newFromCityId)
    setToCityId(newToCityId)
    setFromText(getCityName(newFromCityId))
    setToText(getCityName(newToCityId))
    setCloseSignal((c) => c + 1)
  }

  const handleSearch = () => {
    let nextFromError: string | undefined
    let nextToError: string | undefined

    if (fromCityId === null) nextFromError = 'Please select a valid city'
    if (toCityId === null) nextToError = 'Please select a valid city'

    if (fromCityId !== null && toCityId !== null && fromCityId === toCityId) {
      nextFromError = 'From and To cannot be the same'
      nextToError = 'From and To cannot be the same'
    }

    setFromError(nextFromError)
    setToError(nextToError)
  }

  return (
    <div className="search-card">
      <div className="search-row">
        <div className="search-fields">
          <div className="field city-field">
            <span className="field-icon">🚌</span>
            <CityAutocomplete
              id="from"
              ariaLabel="From"
              cities={cities}
              value={fromText}
              onValueChange={setFromText}
              selectedCityId={fromCityId}
              onSelectCity={(cityId) => setFromCityId(cityId)}
              error={fromError}
              closeSignal={closeSignal}
            />
          </div>
          <button type="button" className="swap-btn" aria-label="Swap From and To" onClick={handleSwap}>
            ⇄
          </button>
          <div className="field city-field">
            <span className="field-icon">🚌</span>
            <CityAutocomplete
              id="to"
              ariaLabel="To"
              cities={cities}
              value={toText}
              onValueChange={setToText}
              selectedCityId={toCityId}
              onSelectCity={(cityId) => setToCityId(cityId)}
              error={toError}
              closeSignal={closeSignal}
            />
          </div>
          <div className="field date-field">
            <span className="field-icon">📅</span>
            <div className="date-text">
              <small>Date of Journey</small>
              <strong>{formatDate(date)}</strong>
              <em>{dayOffset === 0 ? '(Today)' : '(Tomorrow)'}</em>
            </div>
            <button type="button" className={`chip ${dayOffset === 0 ? 'chip-active' : ''}`} onClick={() => setDayOffset(0)}>
              Today
            </button>
            <button type="button" className={`chip ${dayOffset === 1 ? 'chip-active' : ''}`} onClick={() => setDayOffset(1)}>
              Tomorrow
            </button>
          </div>
        </div>
        <div className="women-box">
          <span className="women-icon">👩</span>
          <div>
            <div>Booking for women</div>
            <a href="#">Know more</a>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={forWomen}
            aria-label="Booking for women"
            className={`toggle ${forWomen ? 'on' : ''}`}
            onClick={() => setForWomen((v) => !v)}
          />
        </div>
      </div>
      <button type="button" className="search-btn" onClick={handleSearch}>
        ⌕ Search buses
      </button>
    </div>
  )
}

export default SearchCard

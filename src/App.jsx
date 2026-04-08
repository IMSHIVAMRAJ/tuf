import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'wall-calendar-state-v1'
const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1418985991508-e47386d96a71?auto=format&fit=crop&w=1400&q=80',
]

const MONTH_THEMES = [
  { label: 'Frost Trail', accent: '#3b82c4', soft: '#d9ebf8', quote: 'Fresh starts grow in quiet mornings.' },
  { label: 'Peak Air', accent: '#2f6f96', soft: '#d2e6f1', quote: 'Small steps shape strong months.' },
  { label: 'Thaw Light', accent: '#2f9b8f', soft: '#d2f1ec', quote: 'Momentum loves consistency.' },
  { label: 'Spring Lift', accent: '#2f9f6d', soft: '#d7f2e5', quote: 'Plan boldly, adjust gently.' },
  { label: 'Sun Path', accent: '#c68a2f', soft: '#faedd8', quote: 'Make room for deep work and fresh air.' },
  { label: 'Blue Wind', accent: '#2f7bb9', soft: '#d8eafb', quote: 'The best routines are the ones you keep.' },
  { label: 'High Summer', accent: '#d36a37', soft: '#fae2d8', quote: 'Energy follows intention.' },
  { label: 'Late Light', accent: '#c7732d', soft: '#f9e7d8', quote: 'Leave white space for what matters.' },
  { label: 'Golden Ridge', accent: '#b27b2f', soft: '#f4e6d6', quote: 'Focus on fewer, better priorities.' },
  { label: 'Crisp Air', accent: '#8b6ea9', soft: '#e8e0f3', quote: 'Finish strong with clear boundaries.' },
  { label: 'Deep Forest', accent: '#2f7868', soft: '#d9eee9', quote: 'Reflect, refine, repeat.' },
  { label: 'Year End', accent: '#2c5c8e', soft: '#d4e3f1', quote: 'Celebrate progress, not perfection.' },
]

function zeroTime(value) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function toIsoDate(value) {
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, '0')
  const day = `${value.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fromIsoDate(value) {
  if (!value) {
    return null
  }
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) {
    return null
  }
  return new Date(year, month - 1, day)
}

function monthKey(value) {
  return `${value.getFullYear()}-${value.getMonth() + 1}`
}

function rangeKey(start, end) {
  if (!start || !end) {
    return null
  }
  return `${toIsoDate(start)}__${toIsoDate(end)}`
}

function buildCalendarCells(monthDate) {
  const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const mondayIndex = (firstDayOfMonth.getDay() + 6) % 7
  const gridStart = new Date(firstDayOfMonth)
  gridStart.setDate(firstDayOfMonth.getDate() - mondayIndex)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    return {
      date,
      inCurrentMonth: date.getMonth() === monthDate.getMonth(),
    }
  })
}

function App() {
  const [activeMonth, setActiveMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  )
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [monthNotes, setMonthNotes] = useState({})
  const [rangeNotes, setRangeNotes] = useState({})
  const [noteMode, setNoteMode] = useState('month')

  useEffect(() => {
    const savedRaw = window.localStorage.getItem(STORAGE_KEY)
    if (!savedRaw) {
      return
    }

    try {
      const saved = JSON.parse(savedRaw)
      const restoredMonth = fromIsoDate(saved.activeMonth)
      if (restoredMonth) {
        setActiveMonth(new Date(restoredMonth.getFullYear(), restoredMonth.getMonth(), 1))
      }

      setMonthNotes(saved.monthNotes ?? {})
      setRangeNotes(saved.rangeNotes ?? {})
      setStartDate(fromIsoDate(saved.startDate))
      setEndDate(fromIsoDate(saved.endDate))
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const payload = {
      monthNotes,
      rangeNotes,
      startDate: startDate ? toIsoDate(startDate) : null,
      endDate: endDate ? toIsoDate(endDate) : null,
      activeMonth: toIsoDate(new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1)),
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [activeMonth, endDate, monthNotes, rangeNotes, startDate])

  const cells = useMemo(() => buildCalendarCells(activeMonth), [activeMonth])
  const monthLabel = `${MONTH_NAMES[activeMonth.getMonth()]} ${activeMonth.getFullYear()}`
  const currentMonthKey = monthKey(activeMonth)
  const currentRangeKey = rangeKey(startDate, endDate)
  const todayIso = toIsoDate(new Date())
  const heroImage = HERO_IMAGES[activeMonth.getMonth()]
  const theme = MONTH_THEMES[activeMonth.getMonth()]

  const monthNoteValue = monthNotes[currentMonthKey] ?? ''
  const rangeNoteValue = currentRangeKey ? rangeNotes[currentRangeKey] ?? '' : ''
  const selectedDuration =
    startDate && endDate
      ? Math.round((zeroTime(endDate).getTime() - zeroTime(startDate).getTime()) / 86400000) + 1
      : 0

  const selectionLabel = startDate
    ? endDate
      ? `${toIsoDate(startDate)} to ${toIsoDate(endDate)} (${selectedDuration} day${selectedDuration > 1 ? 's' : ''})`
      : `Start: ${toIsoDate(startDate)}`
    : 'No dates selected'
  const rangeFillPercent = Math.min((selectedDuration / 31) * 100, 100)

  function navigateMonth(step) {
    setActiveMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + step, 1))
  }

  function clearSelection() {
    setStartDate(null)
    setEndDate(null)
    setNoteMode('month')
  }

  function updateMonthNote(value) {
    setMonthNotes((prev) => ({ ...prev, [currentMonthKey]: value }))
  }

  function updateRangeNote(value) {
    if (!currentRangeKey) {
      return
    }
    setRangeNotes((prev) => ({ ...prev, [currentRangeKey]: value }))
  }

  function isInRange(date) {
    if (!startDate || !endDate) {
      return false
    }
    const value = zeroTime(date).getTime()
    return value > zeroTime(startDate).getTime() && value < zeroTime(endDate).getTime()
  }

  function isBoundary(date) {
    const iso = toIsoDate(date)
    if (startDate && iso === toIsoDate(startDate)) {
      return 'start'
    }
    if (endDate && iso === toIsoDate(endDate)) {
      return 'end'
    }
    return null
  }

  function handleDateClick(date, inCurrentMonth) {
    const normalized = zeroTime(date)

    if (!inCurrentMonth) {
      setActiveMonth(new Date(normalized.getFullYear(), normalized.getMonth(), 1))
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(normalized)
      setEndDate(null)
      setNoteMode('range')
      return
    }

    if (normalized.getTime() < zeroTime(startDate).getTime()) {
      setEndDate(zeroTime(startDate))
      setStartDate(normalized)
      setNoteMode('range')
      return
    }

    setEndDate(normalized)
    setNoteMode('range')
  }

  return (
    <main className="page-shell">
      <section
        className="calendar-card"
        aria-label="Interactive wall calendar"
        style={{ '--accent-color': theme.accent, '--accent-soft': theme.soft }}
      >
        <div className="wire-hanger" aria-hidden="true" />

        <div className="calendar-layout">
          <aside className="hero-panel">
            <div className="spiral-strip" aria-hidden="true" />
            <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }}>
              <div className="season-sticker">{theme.label}</div>
              <div className="month-badge">
                <span>{activeMonth.getFullYear()}</span>
                <strong>{MONTH_NAMES[activeMonth.getMonth()].toUpperCase()}</strong>
              </div>
            </div>
          </aside>

          <section className="grid-panel">
            <header className="calendar-header">
              <button type="button" onClick={() => navigateMonth(-1)} aria-label="Previous month">
                Prev
              </button>
              <h1>{monthLabel}</h1>
              <button type="button" onClick={() => navigateMonth(1)} aria-label="Next month">
                Next
              </button>
            </header>

            <div key={monthLabel} className="calendar-grid month-shift" role="grid" aria-label={monthLabel}>
              {WEEKDAYS.map((day) => (
                <div className="weekday" key={day} role="columnheader">
                  {day}
                </div>
              ))}

              {cells.map((cell, index) => {
                const boundary = isBoundary(cell.date)
                const iso = toIsoDate(cell.date)
                const inRange = isInRange(cell.date)
                const isToday = iso === todayIso
                const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6
                const classNames = [
                  'day-cell',
                  cell.inCurrentMonth ? 'in-month' : 'out-month',
                  isWeekend ? 'weekend' : '',
                  inRange ? 'in-range' : '',
                  boundary ? `is-${boundary}` : '',
                  isToday ? 'is-today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <button
                    key={iso}
                    type="button"
                    className={classNames}
                    style={{ '--stagger': `${index * 12}ms` }}
                    onClick={() => handleDateClick(cell.date, cell.inCurrentMonth)}
                    aria-label={`Select ${iso}`}
                  >
                    {cell.date.getDate()}
                  </button>
                )
              })}
            </div>

            <footer className="selection-summary">
              <div className="selection-copy">
                <p>{selectionLabel}</p>
                <div className="range-meter" aria-hidden="true">
                  <span style={{ width: `${rangeFillPercent}%` }} />
                </div>
              </div>
              <button type="button" onClick={clearSelection} disabled={!startDate}>
                Clear selection
              </button>
            </footer>
          </section>

          <section className="notes-panel">
            <div className="notes-head">
              <h2>Notes</h2>
              <div className="note-mode-switch" role="tablist" aria-label="Note target">
                <button
                  type="button"
                  role="tab"
                  aria-selected={noteMode === 'month'}
                  className={noteMode === 'month' ? 'active' : ''}
                  onClick={() => setNoteMode('month')}
                >
                  Month
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={noteMode === 'range'}
                  className={noteMode === 'range' ? 'active' : ''}
                  onClick={() => setNoteMode('range')}
                >
                  Range
                </button>
              </div>
            </div>

            <label className="notes-label" htmlFor="notes-textarea">
              {noteMode === 'month'
                ? `Monthly memo for ${monthLabel}`
                : currentRangeKey
                  ? `Range note: ${selectionLabel}`
                  : 'Select a full date range first'}
            </label>

            <p className="month-quote">{theme.quote}</p>

            <textarea
              id="notes-textarea"
              value={noteMode === 'month' ? monthNoteValue : rangeNoteValue}
              onChange={(event) =>
                noteMode === 'month'
                  ? updateMonthNote(event.target.value)
                  : updateRangeNote(event.target.value)
              }
              placeholder={
                noteMode === 'month'
                  ? 'Write your key goals, reminders, or appointments for this month.'
                  : 'Attach details to the selected date range.'
              }
              disabled={noteMode === 'range' && !currentRangeKey}
            />

            <ul className="legend">
              <li>
                <span className="dot start-dot" /> Range start/end
              </li>
              <li>
                <span className="dot fill-dot" /> In-between days
              </li>
              <li>
                <span className="dot today-dot" /> Today
              </li>
            </ul>
          </section>
        </div>
      </section>
    </main>
  )
}

export default App
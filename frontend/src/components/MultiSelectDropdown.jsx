import { useState, useRef, useEffect } from 'react'

function MultiSelectDropdown({ label, options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleItem = (item) => {
    onChange(selected.includes(item) ? selected.filter((s) => s !== item) : [...selected, item])
  }

  const filteredOptions = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={containerRef} className="relative">
      <div className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
        {label}
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left border border-slate-300 dark:border-slate-600
                   bg-white dark:bg-slate-800
                   text-slate-900 dark:text-slate-100
                   rounded p-2 flex justify-between items-center
                   focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <span className={selected.length === 0 ? 'text-slate-400 dark:text-slate-500' : ''}>
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </span>
        <span className="text-slate-400">{open ? '▲' : '▼'}</span>
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selected.map((item) => (
            <span
              key={item}
              className="bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300
                         text-xs px-2 py-1 rounded-full flex items-center gap-1"
            >
              {item}
              <button
                type="button"
                onClick={() => toggleItem(item)}
                className="hover:text-teal-950 dark:hover:text-teal-100"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800
                         border border-slate-300 dark:border-slate-600
                         rounded shadow-lg max-h-64 overflow-y-auto">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border-b border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800
                       text-slate-900 dark:text-slate-100
                       text-sm focus:outline-none"
            autoFocus
          />
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-sm text-slate-400 dark:text-slate-500">No matches</div>
          ) : (
            filteredOptions.map((item) => (
              <label
                key={item}
                className="flex items-center gap-2 px-3 py-2 text-sm
                           text-slate-700 dark:text-slate-300
                           hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(item)}
                  onChange={() => toggleItem(item)}
                  className="accent-teal-600"
                />
                {item}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default MultiSelectDropdown
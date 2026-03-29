export default function Card({ children, className = '', hover = false, accent = null }) {
  const accentColors = {
    red:    'border-l-4 border-l-[var(--accent-1)]',
    blue:   'border-l-4 border-l-[var(--accent-2)]',
    yellow: 'border-l-4 border-l-[var(--accent-3)]',
    green:  'border-l-4 border-l-[var(--accent-4)]',
    purple: 'border-l-4 border-l-[var(--accent-5)]',
  }

  return (
    <div
      className={`
        rounded-xl border p-5
        bg-[var(--bg-card)] border-[var(--border)]
        shadow-[var(--shadow)]
        transition-all duration-200
        ${hover ? 'hover:shadow-[var(--shadow-lg)] hover:bg-[var(--bg-card-hover)] hover:-translate-y-0.5 cursor-pointer' : ''}
        ${accent ? accentColors[accent] : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

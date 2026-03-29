import { useMemo } from 'react'

const LABELS_PRETTY = {
  study_hours: 'Study Hrs',
  attendance: 'Attendance',
  assignment_score: 'Assignment',
  exam_score: 'Exam Score',
}

function getColor(value, isDark) {
  // -1 → blue, 0 → neutral, 1 → red/orange
  const abs = Math.abs(value)
  if (value > 0) {
    // positive: orange/red
    const r = Math.round(232 + (23 - 232) * (1 - abs))
    const g = Math.round(93 + (200 - 93) * (1 - abs))
    const b = Math.round(74 + (200 - 74) * (1 - abs))
    return `rgb(${r},${g},${b})`
  } else {
    // negative: blue
    const r = Math.round(61 + (200 - 61) * (1 - abs))
    const g = Math.round(139 + (200 - 139) * (1 - abs))
    const b = Math.round(205 + (200 - 205) * (1 - abs))
    return `rgb(${r},${g},${b})`
  }
}

export default function HeatmapChart({ data, height = 320 }) {
  const isDark = document.documentElement.classList.contains('dark')

  const { labels, matrix } = useMemo(() => {
    if (!data) return { labels: [], matrix: [] }
    return data
  }, [data])

  if (!labels.length) return (
    <div className="flex items-center justify-center h-64 text-[var(--text-muted)] text-sm">
      No correlation data
    </div>
  )

  const n = labels.length
  const cellSize = Math.min(80, Math.floor((height - 60) / n))
  const svgW = cellSize * n + 100
  const svgH = cellSize * n + 80

  return (
    <div className="overflow-x-auto">
      <svg width={svgW} height={svgH} style={{ maxWidth: '100%' }}>
        {/* Column headers */}
        {labels.map((label, j) => (
          <text
            key={`col-${j}`}
            x={100 + j * cellSize + cellSize / 2}
            y={40}
            textAnchor="middle"
            fontSize={10}
            fontFamily="var(--font-mono)"
            fill="var(--text-muted)"
          >
            {LABELS_PRETTY[label] || label}
          </text>
        ))}

        {labels.map((rowLabel, i) => (
          <g key={`row-${i}`}>
            {/* Row label */}
            <text
              x={95}
              y={60 + i * cellSize + cellSize / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={10}
              fontFamily="var(--font-mono)"
              fill="var(--text-muted)"
            >
              {LABELS_PRETTY[rowLabel] || rowLabel}
            </text>

            {matrix[i]?.map((val, j) => {
              const x = 100 + j * cellSize
              const y = 60 + i * cellSize
              const color = getColor(val, isDark)
              const textColor = Math.abs(val) > 0.5 ? '#fff' : 'var(--text-secondary)'
              return (
                <g key={`cell-${i}-${j}`}>
                  <rect
                    x={x + 1} y={y + 1}
                    width={cellSize - 2} height={cellSize - 2}
                    fill={color}
                    rx={4}
                    opacity={0.9}
                  />
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                    fontWeight="600"
                    fill={textColor}
                  >
                    {val.toFixed(2)}
                  </text>
                </g>
              )
            })}
          </g>
        ))}

        {/* Color legend */}
        <defs>
          <linearGradient id="heatLegend" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(61,139,205)" />
            <stop offset="50%" stopColor="rgb(200,200,200)" />
            <stop offset="100%" stopColor="rgb(232,93,74)" />
          </linearGradient>
        </defs>
        <rect x={100} y={svgH - 18} width={cellSize * n} height={8} rx={4} fill="url(#heatLegend)" />
        <text x={100} y={svgH - 4} fontSize={9} fontFamily="var(--font-mono)" fill="var(--text-muted)">-1</text>
        <text x={100 + cellSize * n} y={svgH - 4} fontSize={9} fontFamily="var(--font-mono)" fill="var(--text-muted)" textAnchor="end">+1</text>
        <text x={100 + (cellSize * n) / 2} y={svgH - 4} fontSize={9} fontFamily="var(--font-mono)" fill="var(--text-muted)" textAnchor="middle">0</text>
      </svg>
    </div>
  )
}

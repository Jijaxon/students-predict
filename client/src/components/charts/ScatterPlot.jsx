import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Label
} from 'recharts'

const CLUSTER_COLORS = [
  'var(--accent-1)',
  'var(--accent-2)',
  'var(--accent-3)',
  'var(--accent-4)',
  'var(--accent-5)',
]

const CLUSTER_NAMES = ['High Performers', 'Average Students', 'Needs Support', 'Group D', 'Group E']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="custom-tooltip">
      <p className="font-mono text-xs text-[var(--text-muted)] mb-1">{d.student_id}</p>
      <p className="text-sm"><span className="text-[var(--text-muted)]">Study Hours:</span> <strong>{d.study_hours}h</strong></p>
      <p className="text-sm"><span className="text-[var(--text-muted)]">Exam Score:</span> <strong>{d.exam_score}</strong></p>
      {d.attendance !== undefined && (
        <p className="text-sm"><span className="text-[var(--text-muted)]">Attendance:</span> <strong>{d.attendance}%</strong></p>
      )}
      {d.cluster !== undefined && (
        <p className="text-sm mt-1">
          <span
            className="inline-block w-2 h-2 rounded-full mr-1"
            style={{ backgroundColor: CLUSTER_COLORS[d.cluster % CLUSTER_COLORS.length] }}
          />
          {CLUSTER_NAMES[d.cluster] || `Cluster ${d.cluster}`}
        </p>
      )}
    </div>
  )
}

export default function ScatterPlot({ data = [], useClusters = false, nClusters = 3, height = 340 }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-64 text-[var(--text-muted)] text-sm">
      No data available
    </div>
  )

  if (useClusters) {
    // Group data by cluster
    const grouped = {}
    data.forEach(d => {
      const c = d.cluster ?? 0
      if (!grouped[c]) grouped[c] = []
      grouped[c].push(d)
    })

    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis
            type="number" dataKey="study_hours"
            domain={[0, 12]}
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
          >
            <Label value="Study Hours / Day" offset={-10} position="insideBottom" fill="var(--text-muted)" fontSize={11} />
          </XAxis>
          <YAxis
            type="number" dataKey="exam_score"
            domain={[0, 105]}
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
          >
            <Label value="Exam Score" angle={-90} position="insideLeft" fill="var(--text-muted)" fontSize={11} />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>}
          />
          {Object.entries(grouped).map(([cid, points]) => (
            <Scatter
              key={cid}
              name={CLUSTER_NAMES[parseInt(cid)] || `Cluster ${cid}`}
              data={points}
              fill={CLUSTER_COLORS[parseInt(cid) % CLUSTER_COLORS.length]}
              fillOpacity={0.75}
              r={4}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    )
  }

  // No clusters — single scatter
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
        <XAxis
          type="number" dataKey="study_hours"
          domain={[0, 12]}
          tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          tickLine={false}
        >
          <Label value="Study Hours / Day" offset={-10} position="insideBottom" fill="var(--text-muted)" fontSize={11} />
        </XAxis>
        <YAxis
          type="number" dataKey="exam_score"
          domain={[0, 105]}
          tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          tickLine={false}
        >
          <Label value="Exam Score" angle={-90} position="insideLeft" fill="var(--text-muted)" fontSize={11} />
        </YAxis>
        <Tooltip content={<CustomTooltip />} />
        <Scatter data={data} fill="var(--accent-2)" fillOpacity={0.65} r={4} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

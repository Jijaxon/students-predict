import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchClusters, fetchElbow, setNClusters } from '../store/studentSlice'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ScatterPlot from '../components/charts/ScatterPlot'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, BookOpen, Clock, AlertTriangle } from 'lucide-react'

const CLUSTER_COLORS = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)']
const ACCENT_NAMES = ['red', 'blue', 'yellow', 'green', 'purple']

export default function Clustering() {
  const dispatch = useDispatch()
  const { clusters, clusterStats, nClusters, loadingClusters, elbowData, loadingElbow } = useSelector(s => s.students)
  const [showElbow, setShowElbow] = useState(false)

  useEffect(() => {
    dispatch(fetchClusters(nClusters))
  }, [dispatch, nClusters])

  useEffect(() => {
    if (showElbow && !elbowData) dispatch(fetchElbow())
  }, [showElbow, elbowData, dispatch])

  const handleKChange = (k) => {
    dispatch(setNClusters(k))
  }

  const elbowChartData = elbowData?.k_values?.map((k, i) => ({
    k,
    inertia: elbowData.inertia_values[i],
  })) || []

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold text-[var(--text-primary)] mb-1">
            KMeans Clustering
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Group students by study hours, attendance, and exam score
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-[var(--text-muted)]">Clusters (k):</span>
          {[2, 3, 4, 5].map(k => (
            <button
              key={k}
              onClick={() => handleKChange(k)}
              className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border
                ${nClusters === k
                  ? 'bg-[var(--accent-1)] text-white border-[var(--accent-1)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent-1)]'
                }`}
            >
              {k}
            </button>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setShowElbow(!showElbow)}>
            {showElbow ? 'Hide' : 'Elbow Method'}
          </Button>
        </div>
      </div>

      {/* Elbow chart */}
      {showElbow && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-mono text-sm font-bold text-[var(--text-primary)]">Elbow Method</h3>
              <p className="text-xs text-[var(--text-muted)]">
                {elbowData ? `Optimal k = ${elbowData.optimal_k}` : 'Loading…'}
              </p>
            </div>
          </div>
          {loadingElbow ? (
            <div className="skeleton h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={elbowChartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="k" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} label={{ value: 'Number of Clusters (k)', position: 'insideBottom', offset: -10, fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={(v) => `k = ${v}`}
                  formatter={(v) => [v.toFixed(1), 'Inertia']}
                />
                {elbowData?.optimal_k && (
                  <ReferenceLine x={elbowData.optimal_k} stroke="var(--accent-1)" strokeDasharray="4 4" label={{ value: 'Optimal', fill: 'var(--accent-1)', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                )}
                <Line type="monotone" dataKey="inertia" stroke="var(--accent-2)" strokeWidth={2} dot={{ fill: 'var(--accent-2)', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      )}

      {/* Cluster stats cards */}
      {loadingClusters ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(nClusters).fill(0).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] p-5 bg-[var(--bg-card)]">
              <div className="skeleton h-5 w-32 mb-3" />
              <div className="space-y-2">
                {Array(4).fill(0).map((_, j) => <div key={j} className="skeleton h-4 w-full" />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-4 ${nClusters <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
          {clusterStats.map((stat) => (
            <Card key={stat.cluster_id} accent={ACCENT_NAMES[stat.cluster_id % ACCENT_NAMES.length]}>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CLUSTER_COLORS[stat.cluster_id % CLUSTER_COLORS.length] }}
                />
                <span className="font-mono text-sm font-bold text-[var(--text-primary)]">{stat.label}</span>
                <span className="ml-auto text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
                  {stat.size} students
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'Avg Study Hours', value: `${stat.avg_study_hours}h`, icon: Clock },
                  { label: 'Avg Attendance',  value: `${stat.avg_attendance}%`, icon: BookOpen },
                  { label: 'Avg Assignment',  value: stat.avg_assignment_score,  icon: TrendingUp },
                  { label: 'Avg Exam Score',  value: stat.avg_exam_score,        icon: TrendingUp },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Icon size={11} />
                      {label}
                    </span>
                    <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* At-risk alert */}
      {clusters?.at_risk_students?.length > 0 && (
        <Card className="border-[var(--accent-1)] border-opacity-50">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-[var(--accent-1)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                {clusters.at_risk_students.length} At-Risk Students Detected
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-2">
                Low attendance (&lt;60%), low exam score (&lt;40%), or study hours &lt;2h/day
              </p>
              <div className="flex flex-wrap gap-1">
                {clusters.at_risk_students.slice(0, 15).map(id => (
                  <span key={id} className="font-mono text-xs bg-[var(--bg-secondary)] px-2 py-0.5 rounded text-[var(--accent-1)]">
                    {id}
                  </span>
                ))}
                {clusters.at_risk_students.length > 15 && (
                  <span className="text-xs text-[var(--text-muted)] py-0.5">
                    +{clusters.at_risk_students.length - 15} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Scatter plot */}
      <Card>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-mono text-sm font-bold text-[var(--text-primary)]">
            Cluster Visualization
          </h3>
          {clusters && (
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Inertia: {clusters.inertia}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Study hours vs exam score — colored by cluster
          {clusters?.explained_variance && (
            <span className="ml-2">
              · PCA variance: {(clusters.explained_variance[0] * 100).toFixed(1)}% + {(clusters.explained_variance[1] * 100).toFixed(1)}%
            </span>
          )}
        </p>
        {loadingClusters ? (
          <div className="skeleton h-80 w-full" />
        ) : (
          <ScatterPlot
            data={clusters?.students || []}
            useClusters
            nClusters={nClusters}
            height={380}
          />
        )}
      </Card>
    </div>
  )
}

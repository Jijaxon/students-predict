import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchClusteringComparison } from '../store/studentSlice'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ScatterPlot from '../components/charts/ScatterPlot'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter } from 'recharts'
import { TrendingUp, CheckCircle, AlertCircle, Zap, Users, Target } from 'lucide-react'

const COLORS = {
  kmeans: '#ef4444',     // red
  dbscan: '#3b82f6',     // blue
  winner: '#10b981',     // green
}

export default function Comparison() {
  const dispatch = useDispatch()
  const { comparisonData, loadingComparison } = useSelector(s => s.students)
  const [nClusters, setNClusters] = useState(3)

  useEffect(() => {
    handleRunComparison()
  }, [])

  const handleRunComparison = () => {
    dispatch(fetchClusteringComparison({ nClusters, eps: null, minSamples: 5 }))
  }

  if (loadingComparison) {
    return (
      <div className="page-enter max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="skeleton h-12 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="skeleton h-96" />
            <div className="skeleton h-96" />
          </div>
        </div>
      </div>
    )
  }

  if (!comparisonData) {
    return (
      <div className="page-enter max-w-7xl mx-auto px-4 py-8">
        <Card>
          <p className="text-center text-[var(--text-muted)]">Click "Run Comparison" to analyze both algorithms</p>
        </Card>
      </div>
    )
  }

  const { algorithms, metrics, comparison, overall_winner, kmeans_wins, dbscan_wins, visualization, summary } = comparisonData

  // Prepare metrics comparison chart data
  const metricsChartData = [
    {
      metric: 'Silhouette',
      kmeans: metrics.kmeans.silhouette_score,
      dbscan: metrics.dbscan.silhouette_score,
    },
    {
      metric: 'Calinski-Harabasz',
      kmeans: Math.min(metrics.kmeans.calinski_harabasz_index / 100, 1),
      dbscan: Math.min(metrics.dbscan.calinski_harabasz_index / 100, 1),
    },
    {
      metric: 'Davies-Bouldin (inv)',
      kmeans: 1 - Math.min(metrics.kmeans.davies_bouldin_index / 3, 1),
      dbscan: 1 - Math.min(metrics.dbscan.davies_bouldin_index / 3, 1),
    },
  ]

  // Cluster visualization - prepare data for scatter plot
  const kmeansPoints = visualization.kmeans.map(p => ({
    ...p,
    algorithm: 'kmeans',
  }))

  const dbscanPoints = visualization.dbscan.map(p => ({
    ...p,
    algorithm: 'dbscan',
  }))

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold text-[var(--text-primary)] mb-1">
            Algorithm Comparison
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            KMeans vs DBSCAN: Performance Analysis & Metrics
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-[var(--text-muted)]">K (KMeans):</span>
          {[2, 3, 4, 5].map(k => (
            <button
              key={k}
              onClick={() => setNClusters(k)}
              className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border
                ${nClusters === k
                  ? 'bg-[var(--accent-1)] text-white border-[var(--accent-1)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent-1)]'
                }`}
            >
              {k}
            </button>
          ))}
          <Button onClick={handleRunComparison} disabled={loadingComparison}>
            {loadingComparison ? 'Running...' : 'Run Comparison'}
          </Button>
        </div>
      </div>

      {/* Overall Winner */}
      <Card className="border-2 border-[var(--accent-green)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[var(--accent-green)]/20 rounded-lg">
              <Zap className="w-5 h-5 text-[var(--accent-green)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] font-mono">Overall Winner</p>
              <h2 className="font-mono text-lg font-bold text-[var(--text-primary)]">
                {overall_winner === 'Tie' ? '🤝 It\'s a Tie!' : `🏆 ${overall_winner}`}
              </h2>
            </div>
          </div>
          <div className="text-right">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--text-muted)]">KMeans Wins</p>
                <p className="text-lg font-bold text-[var(--accent-1)]">{kmeans_wins}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">DBSCAN Wins</p>
                <p className="text-lg font-bold text-[var(--accent-2)]">{dbscan_wins}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Algorithm Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* KMeans */}
        <Card className="border border-[var(--accent-1)]">
          <div className="mb-4">
            <h3 className="font-mono text-lg font-bold text-[var(--text-primary)] mb-1">
              📊 KMeans
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {algorithms.kmeans.description}
            </p>
          </div>
          <div className="space-y-2 text-xs mb-4">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Number of Clusters:</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">{algorithms.kmeans.n_clusters}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Inertia:</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">{algorithms.kmeans.inertia}</span>
            </div>
          </div>
        </Card>

        {/* DBSCAN */}
        <Card className="border border-[var(--accent-2)]">
          <div className="mb-4">
            <h3 className="font-mono text-lg font-bold text-[var(--text-primary)] mb-1">
              🔍 DBSCAN
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {algorithms.dbscan.description}
            </p>
          </div>
          <div className="space-y-2 text-xs mb-4">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Clusters Found:</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">{algorithms.dbscan.cluster_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Noise Points:</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">{algorithms.dbscan.noise_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Eps (ε):</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">{algorithms.dbscan.eps}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Metrics Comparison */}
      <Card>
        <div className="mb-4">
          <h3 className="font-mono text-sm font-bold text-[var(--text-primary)] mb-2">
            Evaluation Metrics Comparison
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            How well each algorithm groups the students (normalized for comparison)
          </p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metricsChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
              formatter={(v) => v.toFixed(3)}
            />
            <Legend wrapperStyle={{ paddingTop: 20 }} />
            <Bar dataKey="kmeans" fill={COLORS.kmeans} name="KMeans" />
            <Bar dataKey="dbscan" fill={COLORS.dbscan} name="DBSCAN" />
          </BarChart>
        </ResponsiveContainer>

        {/* Detailed Metrics Table */}
        <div className="mt-6 space-y-3">
          {Object.entries(comparison).map(([key, value]) => {
            if (key === 'metric_winners') return null
            if (typeof value !== 'object') return null

            const metricName = key
              .replace(/_/g, ' ')
              .split(' ')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')

            return (
              <div key={key} className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-mono font-bold text-[var(--text-primary)]">
                    {metricName}
                  </p>
                  {value.winner !== 'tie' && (
                    <span className="text-xs font-mono px-2 py-1 bg-[var(--accent-green)]/20 text-[var(--accent-green)] rounded">
                      ✓ {value.winner}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-2">{value.interpretation}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-[var(--bg-primary)] rounded border border-[var(--accent-1)]">
                    <p className="text-xs text-[var(--text-muted)]">KMeans</p>
                    <p className="text-sm font-mono font-bold text-[var(--text-primary)]">
                      {typeof value.kmeans === 'number' ? value.kmeans.toFixed(4) : value.kmeans}
                    </p>
                  </div>
                  <div className="p-2 bg-[var(--bg-primary)] rounded border border-[var(--accent-2)]">
                    <p className="text-xs text-[var(--text-muted)]">DBSCAN</p>
                    <p className="text-sm font-mono font-bold text-[var(--text-primary)]">
                      {typeof value.dbscan === 'number' ? value.dbscan.toFixed(4) : value.dbscan}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Cluster Visualization - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KMeans Scatter Plot */}
        <Card>
          <h3 className="font-mono text-sm font-bold text-[var(--text-primary)] mb-3">
            KMeans Clusters (PCA 2D)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis
                dataKey="x"
                type="number"
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                label={{ value: 'PC1', position: 'bottom', offset: 5, fill: 'var(--text-muted)' }}
              />
              <YAxis
                dataKey="y"
                type="number"
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                label={{ value: 'PC2', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)' }}
              />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              />
              {[0, 1, 2, 3, 4].map((cluster) => {
                const CLUSTER_COLORS = ['#ef4444', '#3b82f6', '#eab308', '#10b981', '#a855f7']
                return (
                  <Scatter
                    key={cluster}
                    name={`Cluster ${cluster}`}
                    data={kmeansPoints.filter(p => p.cluster === cluster)}
                    fill={CLUSTER_COLORS[cluster] || '#999'}
                  />
                )
              })}
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Explained Variance: PC1 {(visualization.explained_variance[0] * 100).toFixed(1)}%, PC2 {(visualization.explained_variance[1] * 100).toFixed(1)}%
          </p>
        </Card>

        {/* DBSCAN Scatter Plot */}
        <Card>
          <h3 className="font-mono text-sm font-bold text-[var(--text-primary)] mb-3">
            DBSCAN Clusters (PCA 2D)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis
                dataKey="x"
                type="number"
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                label={{ value: 'PC1', position: 'bottom', offset: 5, fill: 'var(--text-muted)' }}
              />
              <YAxis
                dataKey="y"
                type="number"
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                label={{ value: 'PC2', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)' }}
              />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              />
              {[0, 1, 2, 3, 4].map((cluster) => {
                const CLUSTER_COLORS = ['#ef4444', '#3b82f6', '#eab308', '#10b981', '#a855f7']
                return (
                  <Scatter
                    key={cluster}
                    name={`Cluster ${cluster}`}
                    data={dbscanPoints.filter(p => p.cluster === cluster)}
                    fill={CLUSTER_COLORS[cluster] || '#999'}
                  />
                )
              })}
              {/* Noise points */}
              <Scatter
                name="Noise"
                data={dbscanPoints.filter(p => p.is_noise)}
                fill="rgba(100,100,100,0.3)"
                shape="diamond"
              />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Explained Variance: PC1 {(visualization.explained_variance[0] * 100).toFixed(1)}%, PC2 {(visualization.explained_variance[1] * 100).toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Summary & Insights */}
      <Card>
        <h3 className="font-mono text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Key Insights
        </h3>
        <div className="space-y-2 text-sm text-[var(--text-muted)]">
          <p>
            <strong className="text-[var(--text-primary)]">Total Students:</strong> {summary.total_students}
          </p>
          <p>
            <strong className="text-[var(--text-primary)]">Features Used:</strong> {summary.features_used.join(', ')}
          </p>
          <p className="text-xs mt-3">
            {summary.note}
          </p>

          {overall_winner === 'KMeans' && (
            <div className="mt-4 p-3 bg-[var(--accent-1)]/10 rounded-lg border border-[var(--accent-1)]">
              <p className="text-xs font-bold text-[var(--accent-1)]">
                ✓ KMeans performed better overall for this dataset. It produces more balanced, well-separated clusters.
              </p>
            </div>
          )}
          {overall_winner === 'DBSCAN' && (
            <div className="mt-4 p-3 bg-[var(--accent-2)]/10 rounded-lg border border-[var(--accent-2)]">
              <p className="text-xs font-bold text-[var(--accent-2)]">
                ✓ DBSCAN performed better overall. It discovered natural cluster patterns and handled outliers effectively.
              </p>
            </div>
          )}
          {overall_winner === 'Tie' && (
            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500">
              <p className="text-xs font-bold text-yellow-600">
                Both algorithms show comparable performance. Choose based on your specific needs.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

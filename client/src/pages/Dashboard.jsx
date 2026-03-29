import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudents, fetchCorrelation, retrainModels } from '../store/studentSlice'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ScatterPlot from '../components/charts/ScatterPlot'
import HeatmapChart from '../components/charts/HeatmapChart'
import { Users, TrendingUp, Clock, BookOpen, RefreshCw, Upload, AlertTriangle } from 'lucide-react'
import api from '../services/api'
import { useRef as useFileRef, useCallback } from 'react'

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <Card accent={accent} className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--bg-secondary)]`}>
        <Icon size={18} style={{ color: `var(--accent-${accent === 'red' ? 1 : accent === 'blue' ? 2 : accent === 'yellow' ? 3 : 4})` }} />
      </div>
      <div>
        <p className="text-[var(--text-muted)] text-xs font-medium mb-0.5">{label}</p>
        <p className="font-mono text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        {sub && <p className="text-[var(--text-muted)] text-xs mt-0.5">{sub}</p>}
      </div>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[var(--border)] p-5 bg-[var(--bg-card)]">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-8 w-16 mb-2" />
      <div className="skeleton h-3 w-32" />
    </div>
  )
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const { students, summary, loadingStudents, correlationData, loadingCorrelation, retraining, retrainSuccess } = useSelector(s => s.students)
  const fileRef = useRef(null)

  useEffect(() => {
    dispatch(fetchStudents())
    dispatch(fetchCorrelation())
  }, [dispatch])

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      await api.post('/students/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      dispatch(fetchStudents())
      dispatch(fetchCorrelation())
      alert('Dataset uploaded and models retrained!')
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.detail || err.message))
    }
    e.target.value = ''
  }, [dispatch])

  const scoreDistribution = summary?.score_distribution

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold text-[var(--text-primary)] mb-1">
            Academic Overview
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Dataset insights and performance distribution
          </p>
        </div>
        <div className="flex gap-2">
          <input type="file" accept=".csv" ref={fileRef} onChange={handleUpload} className="hidden" />
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload size={13} /> Upload CSV
          </Button>
          <Button variant="secondary" size="sm" loading={retraining} onClick={() => dispatch(retrainModels())}>
            <RefreshCw size={13} /> Retrain Models
          </Button>
        </div>
      </div>

      {retrainSuccess && (
        <div className="rounded-lg bg-[var(--accent-4)] bg-opacity-10 border border-[var(--accent-4)] px-4 py-2 text-sm text-white flex items-center gap-2">
          ✓ Models retrained successfully
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStudents ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Students" value={students.length} sub="in dataset" icon={Users} accent="red" />
            <StatCard label="Avg Exam Score" value={summary?.avg_exam_score ?? '—'} sub="out of 100" icon={TrendingUp} accent="blue" />
            <StatCard label="Avg Attendance" value={summary ? `${summary.avg_attendance}%` : '—'} sub="attendance rate" icon={BookOpen} accent="yellow" />
            <StatCard label="Avg Study Hours" value={summary ? `${summary.avg_study_hours}h` : '—'} sub="per day" icon={Clock} accent="green" />
          </>
        )}
      </div>

      {/* Score distribution bar */}
      {scoreDistribution && (
        <Card>
          <p className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">Score Distribution</p>
          <div className="flex gap-1 h-6 rounded-lg overflow-hidden">
            {[
              { key: 'below_50', label: 'Below 50', color: 'var(--accent-1)' },
              { key: '50_to_75', label: '50–75', color: 'var(--accent-3)' },
              { key: 'above_75', label: 'Above 75', color: 'var(--accent-4)' },
            ].map(({ key, label, color }) => {
              const count = scoreDistribution[key]
              const pct = Math.round((count / students.length) * 100)
              return (
                <div
                  key={key}
                  style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.85 }}
                  className="relative group flex-shrink-0 transition-all duration-300"
                  title={`${label}: ${count} students (${pct}%)`}
                >
                  {pct > 12 && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-mono font-bold">
                      {pct}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-2">
            {[
              { label: 'Needs Support', color: 'var(--accent-1)', key: 'below_50' },
              { label: 'Average',       color: 'var(--accent-3)', key: '50_to_75' },
              { label: 'High Perform.', color: 'var(--accent-4)', key: 'above_75' },
            ].map(({ label, color, key }) => (
              <span key={key} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                {label} ({scoreDistribution[key]})
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-mono text-sm font-bold text-[var(--text-primary)] mb-1">
            Study Hours vs Exam Score
          </h3>
          <p className="text-[var(--text-muted)] text-xs mb-4">All students — no clustering</p>
          {loadingStudents ? (
            <div className="skeleton h-64 w-full" />
          ) : (
            <ScatterPlot data={students} useClusters={false} height={280} />
          )}
        </Card>

        <Card>
          <h3 className="font-mono text-sm font-bold text-[var(--text-primary)] mb-1">
            Correlation Heatmap
          </h3>
          <p className="text-[var(--text-muted)] text-xs mb-4">Feature correlation matrix</p>
          {loadingCorrelation ? (
            <div className="skeleton h-64 w-full" />
          ) : (
            <HeatmapChart data={correlationData} height={280} />
          )}
        </Card>
      </div>

      {/* At-a-glance table */}
      {students.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm font-bold text-[var(--text-primary)]">Recent Students</h3>
            <span className="text-xs text-[var(--text-muted)]">Showing 10 of {students.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Student ID', 'Study Hrs', 'Attendance', 'Assignment', 'Exam Score'].map(h => (
                    <th key={h} className="text-left pb-2 pr-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 10).map((s, i) => (
                  <tr key={s.student_id} className={`border-b border-[var(--border)] border-opacity-50 ${i % 2 === 0 ? '' : 'bg-[var(--bg-secondary)] bg-opacity-30'}`}>
                    <td className="py-2 pr-4 font-mono text-xs text-[var(--accent-2)]">{s.student_id}</td>
                    <td className="py-2 pr-4 text-[var(--text-secondary)]">{s.study_hours}h</td>
                    <td className="py-2 pr-4 text-[var(--text-secondary)]">{s.attendance}%</td>
                    <td className="py-2 pr-4 text-[var(--text-secondary)]">{s.assignment_score}</td>
                    <td className="py-2 pr-4">
                      <span className={`font-mono font-bold ${
                        s.exam_score >= 75 ? 'text-[var(--accent-4)]' :
                        s.exam_score >= 50 ? 'text-[var(--accent-3)]' :
                        'text-[var(--accent-1)]'
                      }`}>
                        {s.exam_score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

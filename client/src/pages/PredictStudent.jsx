import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { predictStudent, clearPrediction } from '../store/studentSlice'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Zap, Users, TrendingUp, BookOpen, Clock, RotateCcw } from 'lucide-react'

const CLUSTER_COLORS  = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)']
const CLUSTER_ACCENTS = ['red', 'blue', 'yellow', 'green', 'purple']

function Slider({ label, name, min, max, step = 0.5, value, onChange, unit = '', icon: Icon }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          {Icon && <Icon size={12} />}
          {label}
        </label>
        <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(name, parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--accent-2) ${pct}%, var(--border) ${pct}%)`,
        }}
      />
      <div className="flex justify-between text-xs text-[var(--text-muted)] mt-0.5 font-mono">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

export default function PredictStudent() {
  const dispatch = useDispatch()
  const { prediction, loadingPrediction, error } = useSelector(s => s.students)

  const [form, setForm] = useState({
    study_hours: 5,
    attendance: 75,
    exam_score: 70,
  })

  const handleChange = (name, val) => setForm(f => ({ ...f, [name]: val }))

  const handleSubmit = () => {
    dispatch(predictStudent(form))
  }

  const handleReset = () => {
    dispatch(clearPrediction())
    setForm({ study_hours: 5, attendance: 75, exam_score: 70 })
  }

  const clusterColor  = prediction ? CLUSTER_COLORS[prediction.predicted_cluster % CLUSTER_COLORS.length] : null
  const clusterAccent = prediction ? CLUSTER_ACCENTS[prediction.predicted_cluster % CLUSTER_ACCENTS.length] : null

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="font-mono text-2xl font-bold text-[var(--text-primary)] mb-1">
          Predict Student Group
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          Enter student metrics to classify using the trained Decision Tree
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input form */}
        <Card>
          <h3 className="font-mono text-sm font-bold text-[var(--text-primary)] mb-5">Student Data</h3>
          <div className="space-y-6">
            <Slider
              label="Daily Study Hours"
              name="study_hours"
              min={0} max={12} step={0.5}
              value={form.study_hours}
              unit="h"
              icon={Clock}
              onChange={handleChange}
            />
            <Slider
              label="Attendance Rate"
              name="attendance"
              min={0} max={100} step={1}
              value={form.attendance}
              unit="%"
              icon={BookOpen}
              onChange={handleChange}
            />
            <Slider
              label="Exam Score"
              name="exam_score"
              min={0} max={100} step={1}
              value={form.exam_score}
              unit=""
              icon={TrendingUp}
              onChange={handleChange}
            />
          </div>

          {/* Preview summary */}
          <div className="mt-6 p-3 rounded-lg bg-[var(--bg-secondary)] grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Study', value: `${form.study_hours}h` },
              { label: 'Attend', value: `${form.attendance}%` },
              { label: 'Score', value: form.exam_score },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[var(--text-muted)] text-xs">{label}</p>
                <p className="font-mono font-bold text-sm text-[var(--text-primary)]">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-5">
            <Button onClick={handleSubmit} loading={loadingPrediction} className="flex-1">
              <Zap size={13} />
              Predict Cluster
            </Button>
            {prediction && (
              <Button variant="ghost" onClick={handleReset}>
                <RotateCcw size={13} />
              </Button>
            )}
          </div>
        </Card>

        {/* Result */}
        <div className="space-y-4">
          {!prediction && !loadingPrediction && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-[var(--border)]">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center mb-3">
                <Zap size={20} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-sm text-[var(--text-muted)]">Adjust the sliders and click<br /><strong>Predict Cluster</strong></p>
            </div>
          )}

          {loadingPrediction && (
            <Card>
              <div className="space-y-3">
                <div className="skeleton h-6 w-40" />
                <div className="skeleton h-16 w-full" />
                <div className="skeleton h-4 w-32" />
              </div>
            </Card>
          )}

          {prediction && !loadingPrediction && (
            <>
              {/* Main result */}
              <Card accent={clusterAccent}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-mono text-lg font-bold"
                    style={{ backgroundColor: clusterColor }}
                  >
                    {prediction.predicted_cluster}
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Predicted Group</p>
                    <p className="font-bold text-[var(--text-primary)]">{prediction.cluster_label}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-[var(--text-muted)]">Confidence</p>
                    <p className="font-mono font-bold text-lg" style={{ color: clusterColor }}>
                      {prediction.confidence}%
                    </p>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${prediction.confidence}%`, backgroundColor: clusterColor }}
                  />
                </div>
              </Card>

              {/* Cluster stats */}
              {prediction.cluster_stats && (
                <Card>
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">Cluster Profile</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Students in Group', value: prediction.cluster_stats.size, unit: '' },
                      { label: 'Avg Study Hours',   value: prediction.cluster_stats.avg_study_hours, unit: 'h' },
                      { label: 'Avg Attendance',    value: prediction.cluster_stats.avg_attendance,  unit: '%' },
                      { label: 'Avg Exam Score',    value: prediction.cluster_stats.avg_exam_score,  unit: '' },
                    ].map(({ label, value, unit }) => (
                      <div key={label} className="bg-[var(--bg-secondary)] rounded-lg p-3">
                        <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
                        <p className="font-mono font-bold text-[var(--text-primary)]">{value}{unit}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Similar students */}
              {prediction.similar_students?.length > 0 && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={13} className="text-[var(--text-muted)]" />
                    <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Similar Students</p>
                  </div>
                  <div className="space-y-2">
                    {prediction.similar_students.map(s => (
                      <div key={s.student_id} className="flex items-center justify-between text-xs py-1 border-b border-[var(--border)] border-opacity-50 last:border-0">
                        <span className="font-mono text-[var(--accent-2)]">{s.student_id}</span>
                        <span className="text-[var(--text-muted)]">{s.study_hours}h</span>
                        <span className="text-[var(--text-muted)]">{s.attendance}%</span>
                        <span className="font-mono font-bold" style={{ color: clusterColor }}>{s.exam_score}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

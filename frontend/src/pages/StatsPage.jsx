import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts'
import { getStats } from '../api'
import styles from './StatsPage.module.css'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{payload[0].value}</p>
    </div>
  )
}

function StatsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getStats()
      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading stats...</p>
    </div>
  )
  if (error) return <div className={styles.error}>{error}</div>
  if (!stats) return <div className={styles.empty}>No stats available</div>

  const topBrand = stats.top_brands?.[0]?.brand || '—'
  const topModel = stats.top_models?.[0]?.model || '—'

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <h1>Statistics</h1>
        <p className={styles.subtitle}>Overview of all detections</p>
      </div>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Total Detections</span>
          <span className={styles.cardValue}>{stats.total_detections}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Top Brand</span>
          <span className={styles.cardBrand}>{topBrand}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Top Model</span>
          <span className={styles.cardBrand}>{topModel}</span>
        </div>
      </div>

      {stats.top_brands?.length > 0 && (
        <div className={styles.chartSection}>
          <h2 className={styles.chartTitle}>Top Brands</h2>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.top_brands} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="brand"
                  tick={{ fill: '#6b6b7b', fontSize: 12, fontFamily: 'Rajdhani' }}
                  axisLine={{ stroke: '#2a2a35' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b6b7b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(220, 38, 38, 0.08)' }} />
                <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {stats.detections_by_day?.length > 0 && (
        <div className={styles.chartSection}>
          <h2 className={styles.chartTitle}>Detections — Last 30 Days</h2>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats.detections_by_day} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2a2a35" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#6b6b7b', fontSize: 11 }}
                  axisLine={{ stroke: '#2a2a35' }}
                  tickLine={false}
                  tickFormatter={(v) => v?.slice(5)}
                />
                <YAxis
                  tick={{ fill: '#6b6b7b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#dc2626', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2} fill="url(#accentGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {stats.top_models?.length > 0 && (
        <div className={styles.chartSection}>
          <h2 className={styles.chartTitle}>Top Models</h2>
          <div className={styles.modelList}>
            {stats.top_models.map((m, idx) => (
              <div key={idx} className={styles.modelRow}>
                <span className={styles.modelRank}>#{idx + 1}</span>
                <span className={styles.modelName}>{m.model}</span>
                <span className={styles.modelBar}>
                  <span
                    className={styles.modelFill}
                    style={{ width: `${(m.count / stats.top_models[0].count) * 100}%` }}
                  ></span>
                </span>
                <span className={styles.modelCount}>{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default StatsPage

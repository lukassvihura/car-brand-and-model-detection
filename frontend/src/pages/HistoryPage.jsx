import { useState, useEffect } from 'react'
import { getHistory } from '../api'
import styles from './HistoryPage.module.css'

function HistoryPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [offset, setOffset] = useState(0)
  const LIMIT = 12

  useEffect(() => {
    loadHistory()
  }, [offset])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await getHistory(LIMIT, offset)
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading history...</p>
    </div>
  )
  if (error) return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <div>
          <h1>Detection History</h1>
          <p className={styles.subtitle}>{total} total detection{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>No detections yet</p>
          <p className={styles.emptyHint}>Upload a car image on the Detect page to get started</p>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>#</span>
            <span>Vehicle</span>
            <span>Brand</span>
            <span>Confidence</span>
            <span>Date</span>
          </div>
          {items.map((d, idx) => (
            <div key={d.id} className={styles.tableRow}>
              <span className={styles.rowIndex}>{offset + idx + 1}</span>
              <span className={styles.rowPrediction}>{d.top_prediction}</span>
              <span className={styles.rowBrand}>{d.brand || '—'}</span>
              <span className={styles.rowConfidence}>
                <span className={styles.confBar}>
                  <span className={styles.confFill} style={{width: `${(d.confidence * 100)}%`}}></span>
                </span>
                {(d.confidence * 100).toFixed(1)}%
              </span>
              <span className={styles.rowDate}>
                {new Date(d.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setOffset(Math.max(0, offset - LIMIT))}
            disabled={offset === 0}
            className={styles.pageBtn}
          >
            ← Prev
          </button>
          <span className={styles.pageInfo}>{currentPage} / {totalPages}</span>
          <button
            onClick={() => setOffset(offset + LIMIT)}
            disabled={currentPage >= totalPages}
            className={styles.pageBtn}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

export default HistoryPage

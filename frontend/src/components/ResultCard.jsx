import styles from './ResultCard.module.css'

function ResultCard({ result, preview }) {
  if (!result) return null
  const top5 = result.top5 || []
  const confidencePct = (result.confidence * 100).toFixed(1)

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={preview} alt="Detected car" className={styles.image} />
        <div className={styles.badge}>
          <span className={styles.badgeValue}>{confidencePct}%</span>
          <span className={styles.badgeLabel}>match</span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.label}>Identified as</span>
          <h2 className={styles.prediction}>{result.top_prediction}</h2>
          <div className={styles.meta}>
            {result.brand && <span className={styles.tag}>{result.brand}</span>}
            {result.year && <span className={styles.tag}>{result.year}</span>}
          </div>
        </div>

        <div className={styles.confidence}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{width: `${confidencePct}%`}}
            />
          </div>
        </div>

        {top5.length > 0 && (
          <div className={styles.top5}>
            <h3 className={styles.top5Title}>Other possibilities</h3>
            <div className={styles.top5List}>
              {top5.map((pred, idx) => (
                <div key={idx} className={styles.top5Item}>
                  <span className={styles.top5Rank}>#{idx + 1}</span>
                  <span className={styles.top5Name}>{pred.class_name}</span>
                  <span className={styles.top5Conf}>{(pred.confidence * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className={styles.timestamp}>
          {new Date(result.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default ResultCard

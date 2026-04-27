import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import styles from './Layout.module.css'

function Layout() {
  const [dark, setDark] = useState(() => {
    const saved = window.sessionStorage?.getItem?.('theme')
    return saved === 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    try { window.sessionStorage.setItem('theme', dark ? 'dark' : 'light') } catch {}
  }, [dark])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.checkerLeft}></div>
        <div className={styles.checkerRight}></div>
        <div className={styles.headerInner}>
          <NavLink to="/detect" className={styles.logoLink}>
            <div className={styles.logo}>
              <svg className={styles.logoIcon} width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="1" y="8" width="26" height="13" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="7" cy="21" r="3" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="21" cy="21" r="3" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M5 8L8 3H20L23 8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <line x1="11" y1="3" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="17" y1="3" x2="17" y2="8" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              <div>
                <span className={styles.logoText}>Find my Ride</span>
                <span className={styles.logoSub}>Car Detection AI</span>
              </div>
            </div>
          </NavLink>
          <div className={styles.headerRight}>
            <nav className={styles.nav}>
              <NavLink to="/detect" className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                Detect
              </NavLink>
              <NavLink to="/history" className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                History
              </NavLink>
              <NavLink to="/stats" className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                Stats
              </NavLink>
            </nav>
            <button
              onClick={() => setDark(!dark)}
              className={styles.themeToggle}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? '☀' : '☽'}
            </button>
          </div>
        </div>
        <div className={styles.redStripe}></div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

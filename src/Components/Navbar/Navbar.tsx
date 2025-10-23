import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Navbar.module.css'

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.leftLinks}>
        <Link to="/" className={styles.link}>Home</Link>
        <Link to="/my-items" className={styles.link}>My Items</Link>
      </div>
      <div className={styles.rightLinks}>
        <Link to="/login" className={styles.link}>Login</Link>
      </div>
    </nav>
  )
}

export default Navbar
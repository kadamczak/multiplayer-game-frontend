import React from 'react'
import styles from './HomePage.module.css'

const HomePage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Multiplayer Game</h1>
      <p className={styles.description}>
        Join players from around the world in an exciting gaming experience.
      </p>
    </div>
  )
}

export default HomePage;
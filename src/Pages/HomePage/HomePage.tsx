import { useEffect } from 'react'
import styles from './HomePage.module.css'
import { useLoading } from '../../Context/useLoading'

const HomePage = () => {
  const { setIsLoading } = useLoading();

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Barvon</h1>
      <p className={styles.description}>
        Join players from around the world in an exciting gaming experience.
      </p>

      <img src="/gamescreenshot1.png" alt="Gaming Illustration" className={styles.illustration} />

      <p className={styles.description}>
        Create an account or log in to get started! Haha funny video game! 
      </p>
    </div>
  )
}

export default HomePage;
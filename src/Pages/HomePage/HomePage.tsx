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
    </div>
  )
}

export default HomePage;
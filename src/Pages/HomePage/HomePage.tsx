import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './HomePage.module.css'
import { useLoading } from '../../Context/useLoading'

const HomePage = () => {
  const { t } = useTranslation();
  const { setIsLoading } = useLoading();

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('home.welcome')}</h1>
      <p className={styles.description}>
        {t('home.description')}
      </p>
    </div>
  )
}

export default HomePage;
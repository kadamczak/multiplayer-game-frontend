import { useTranslation } from 'react-i18next'
import styles from './Footer.module.css'
import { useLoading } from '../../Context/useLoading'

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const { isLoading } = useLoading();
  
  if (isLoading) {
    return null;
  }
  
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p>&copy; {currentYear} Barvon. {t('footer.copyright')}</p>
      </div>
    </footer>
  )
}

export default Footer;
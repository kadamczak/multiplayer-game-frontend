import styles from './Footer.module.css'
import { useLoading } from '../../Context/useLoading'

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isLoading } = useLoading();
  
  if (isLoading) {
    return null;
  }
  
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p>&copy; {currentYear} Barvon. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer;
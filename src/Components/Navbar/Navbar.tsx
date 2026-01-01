import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Navbar.module.css'
import { useAuth } from '../../Context/useAuth'

const Navbar = () => {
  const { isLoggedIn, userName, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
    setShowLanguageMenu(false)
  }

  const currentLanguage = i18n.language === 'pl' ? t('language.polish') : t('language.english')

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftLinks}>
        <Link to="/" className={styles.link}>{t('nav.home')}</Link>
        <Link to="/my-items" className={styles.link}>{t('nav.myItems')}</Link>
        <Link to="/marketplace" className={styles.link}>{t('nav.marketplace')}</Link>
        <Link to="/friends" className={styles.link}>{t('nav.friends')}</Link>
      </div>
      <div className={styles.rightLinks}>
        <div className={styles.languageSelector}>
          <button 
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className={styles.languageButton}
          >
            {currentLanguage}
          </button>
          {showLanguageMenu && (
            <div className={styles.languageDropdown}>
              <button 
                onClick={() => changeLanguage('en')}
                className={styles.languageOption}
              >
                {t('language.english')}
              </button>
              <button 
                onClick={() => changeLanguage('pl')}
                className={styles.languageOption}
              >
                {t('language.polish')}
              </button>
            </div>
          )}
        </div>
        {isLoggedIn() ? (
          <>
            <Link to="/profile" className={styles.link}>{userName}</Link>
            <button onClick={logout} className={styles.link}>{t('nav.logout')}</button>
          </>
        ) : (
          <Link to="/login" className={styles.link}>{t('nav.login')}</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
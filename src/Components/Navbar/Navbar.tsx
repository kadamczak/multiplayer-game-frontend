import { Link } from 'react-router-dom'
import styles from './Navbar.module.css'
import { useAuth } from '../../Context/useAuth';

const Navbar = () => {
  const { isLoggedIn, userName, logout } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftLinks}>
        <Link to="/" className={styles.link}>Home</Link>
        <Link to="/my-items" className={styles.link}>My Items</Link>
        <Link to="/marketplace" className={styles.link}>Marketplace</Link>
      </div>
      <div className={styles.rightLinks}>
        {isLoggedIn() ? (
          <>
            <Link to="/profile" className={styles.link}>{userName}</Link>
            <button onClick={logout} className={styles.link}>Logout</button>
          </>
        ) : (
          <Link to="/login" className={styles.link}>Login</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar;
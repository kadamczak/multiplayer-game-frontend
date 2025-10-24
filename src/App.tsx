import './App.css'
import { Outlet } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Footer from './Components/Footer/Footer'
import { UserProvider } from './Context/useAuth'

function App() {
  return (
    <UserProvider>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </UserProvider>
  )
}

export default App

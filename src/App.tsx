import './App.css'
import { Outlet } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Footer from './Components/Footer/Footer'
import { UserProvider } from './Context/useAuth'
import { LoadingProvider } from './Context/useLoading'

function App() {
  return (
    <UserProvider>
      <LoadingProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Outlet />
          </main>
          <Footer />
        </div>
      </LoadingProvider>
    </UserProvider>
  )
}

export default App

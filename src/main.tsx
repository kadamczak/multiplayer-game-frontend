import { createRoot } from 'react-dom/client'
import './reset.css'
import './index.css'
import './i18n'
import { RouterProvider } from 'react-router-dom'
import { router } from './Routes/Routes.tsx'

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)

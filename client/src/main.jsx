
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || (import.meta.env.PROD ? 'https://quickai-m9q6.onrender.com' : 'http://localhost:3000');
// Import your Publishable Key (supports environment variable or fallback)
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_cGxlYXNhbnQtYm94ZXItNy5jbGVyay5hY2NvdW50cy5kZXYk';

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  </ClerkProvider>
)

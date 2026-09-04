import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/merriweather/400.css'
import '@fontsource/merriweather/700.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import './index.css'
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

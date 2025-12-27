import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { UserProvider } from './Context/ContextApt';
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './Context/ThemeContext.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </ThemeProvider>
  </StrictMode>,
)

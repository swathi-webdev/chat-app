import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { useThemeStore } from "./store/useThemeStore";

const theme = useThemeStore.getState().theme;
document.documentElement.setAttribute("data-theme", theme);
createRoot(document.getElementById('root')).render(
<StrictMode>
  <BrowserRouter>
      <App />
    </BrowserRouter>
</StrictMode>
  
 
)

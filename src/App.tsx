import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import HomeScreen from './components/screens/HomeScreen'
import { ThemeProvider } from './theme'
import { trackPageview } from './utils/analytics'

function getRouterBasename(): string {
  const base = import.meta.env.BASE_URL
  return base.endsWith('/') ? base.slice(0, -1) : base
}

function RouteAnalytics() {
  const location = useLocation()

  useEffect(() => {
    trackPageview()
  }, [location.pathname])

  return null
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={getRouterBasename() || undefined}>
        <RouteAnalytics />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

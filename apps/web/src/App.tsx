import './App.css'
import { Router } from 'wouter'
import { ThemeProvider } from './components/providers/ThemeProvider'
import { AuthProvider } from './components/providers/AuthProvider'
import { NavigationProvider } from './components/providers/NavigationProvider'
import { AppLayout } from './components/layout/AppLayout'
import { LazyRoute } from './components/features/navigation/LazyRoute'

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Router>
        <AuthProvider>
          <NavigationProvider>
            <AppLayout>
              <LazyRoute />
            </AppLayout>
          </NavigationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
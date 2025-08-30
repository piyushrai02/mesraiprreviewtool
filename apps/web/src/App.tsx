import './App.css'
import { Router, Route } from 'wouter'
import { ThemeProvider } from './components/providers/ThemeProvider'
import { AuthProvider } from './components/providers/AuthProvider'
import { NavigationProvider } from './components/providers/NavigationProvider'
import { AppLayout } from './components/layout/AppLayout'
import { LazyRoute } from './components/features/navigation/LazyRoute'
import { ProfessionalDashboardPage } from './pages/ProfessionalDashboardPage'

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
            {/* Direct route for professional dashboard */}
            <Route path="/professional" component={ProfessionalDashboardPage} />
            
            {/* Default layout for other routes */}
            <Route path="/*">
              <AppLayout>
                <LazyRoute />
              </AppLayout>
            </Route>
          </NavigationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
import './App.css'
import { ThemeProvider } from './components/providers/ThemeProvider'
import { AuthProvider } from './components/providers/AuthProvider'
import DashboardPage from './app/dashboard/page'

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
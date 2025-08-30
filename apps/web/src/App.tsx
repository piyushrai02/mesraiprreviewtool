import './App.css'
import { ThemeProvider } from './components/providers/ThemeProvider'
import DashboardPage from './app/dashboard/page'

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DashboardPage />
    </ThemeProvider>
  )
}

export default App
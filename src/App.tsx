import { AppStateProvider } from './context/AppStateContext'
import { AppShell } from './components/AppShell'

function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  )
}

export default App

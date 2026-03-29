import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Clustering from './pages/Clustering'
import PredictStudent from './pages/PredictStudent'
import './index.css'

// Apply saved theme on load
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="min-h-screen bg-[var(--bg-primary)]">
          <Navbar />
          <main>
            <Routes>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/clustering" element={<Clustering />} />
              <Route path="/predict"    element={<PredictStudent />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </Provider>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { BottomNav } from './components/Layout/BottomNav'
import { Dashboard } from './pages/Dashboard'
import { AssetDetail } from './pages/AssetDetail'
import { Explore } from './pages/Explore'
import { NewsFeed } from './pages/NewsFeed'
import { Account } from './pages/Account'

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/actif/:id" element={<AssetDetail />} />
          <Route path="/explorer" element={<Explore />} />
          <Route path="/actualites" element={<NewsFeed />} />
          <Route path="/compte" element={<Account />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </UserProvider>
  )
}

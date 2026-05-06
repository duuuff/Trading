import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { UserState, UserPlan } from '../types'
import { FREE_ASSET_LIMIT, STANDARD_ASSET_LIMIT } from '../data/assets'

interface UserContextValue extends UserState {
  isInWatchlist: (assetId: string) => boolean
  toggleWatchlist: (assetId: string) => boolean
  canAddToWatchlist: () => boolean
  watchlistLimit: () => number
  upgradePlan: (plan: UserPlan) => void
  canAccessPremiumContent: () => boolean
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>({
    plan: 'free',
    watchlist: ['SPX', 'AAPL', 'CAC'],
  })

  const isInWatchlist = useCallback(
    (assetId: string) => user.watchlist.includes(assetId),
    [user.watchlist],
  )

  const watchlistLimit = useCallback(() => {
    if (user.plan === 'free') return FREE_ASSET_LIMIT
    if (user.plan === 'standard') return STANDARD_ASSET_LIMIT
    return Infinity
  }, [user.plan])

  const canAddToWatchlist = useCallback(() => {
    const limit = watchlistLimit()
    return user.watchlist.length < limit
  }, [user.watchlist.length, watchlistLimit])

  const toggleWatchlist = useCallback(
    (assetId: string): boolean => {
      if (user.watchlist.includes(assetId)) {
        setUser((prev) => ({
          ...prev,
          watchlist: prev.watchlist.filter((id) => id !== assetId),
        }))
        return true
      }
      const limit = watchlistLimit()
      if (user.watchlist.length >= limit) {
        return false
      }
      setUser((prev) => ({
        ...prev,
        watchlist: [...prev.watchlist, assetId],
      }))
      return true
    },
    [user.watchlist, watchlistLimit],
  )

  const upgradePlan = useCallback((plan: UserPlan) => {
    setUser((prev) => ({ ...prev, plan }))
  }, [])

  const canAccessPremiumContent = useCallback(() => {
    return user.plan !== 'free'
  }, [user.plan])

  return (
    <UserContext.Provider
      value={{
        ...user,
        isInWatchlist,
        toggleWatchlist,
        canAddToWatchlist,
        watchlistLimit,
        upgradePlan,
        canAccessPremiumContent,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}

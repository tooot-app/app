import { StackActions } from '@react-navigation/native'
import { useGlobalStorage } from '@utils/storage/actions'
import { useEffect } from 'react'
import navigationRef from './navigationRef'

// Mostly used when switching account and sub pages were still querying the old instance

const usePopToTop = (name: string) => {
  const [accountActive] = useGlobalStorage.string('account.active')

  useEffect(() => {
    const currentRoute = navigationRef.getCurrentRoute()
    if (currentRoute && currentRoute.name !== name) {
      navigationRef.dispatch(StackActions.popToTop())
    }
  }, [accountActive])
}

export default usePopToTop

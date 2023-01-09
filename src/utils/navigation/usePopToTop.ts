import { StackActions, useFocusEffect, useNavigation } from '@react-navigation/native'
import { useGlobalStorage } from '@utils/storage/actions'
import { useEffect } from 'react'

// Mostly used when switching account and sub pages were still querying the old instance

const usePopToTop = () => {
  const navigation = useNavigation()
  const [accountActive] = useGlobalStorage.string('account.active')

  useEffect(() => {
    navigation.dispatch(StackActions.popToTop())
  }, [accountActive])
}

export default usePopToTop

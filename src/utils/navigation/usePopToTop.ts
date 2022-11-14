import { StackActions, useNavigation } from '@react-navigation/native'
import { getInstanceActive } from '@utils/slices/instancesSlice'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

// Mostly used when switching account and sub pages were still querying the old instance

const usePopToTop = () => {
  const navigation = useNavigation()
  const instanceActive = useSelector(getInstanceActive)

  return useEffect(() => {
    navigation.dispatch(StackActions.popToTop())
  }, [instanceActive])
}

export default usePopToTop

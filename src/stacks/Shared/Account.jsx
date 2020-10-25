import React, { useEffect } from 'react'
import { SafeAreaView, ScrollView, Text } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native'

import { fetch, getState, reset } from 'src/stacks/common/accountSlice'

// Show remote hashtag? Only when private, show local version?

export default function Account ({
  route: {
    params: { id }
  }
}) {
  const dispatch = useDispatch()
  const state = useSelector(getState)

  useEffect(() => {
    if (state.status === 'idle') {
      dispatch(fetch({ id }))
    }
  }, [state, dispatch])

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused

      return () => {
        dispatch(reset())
      }
    }, [])
  )

  return (
    <SafeAreaView>
      <ScrollView>
        <Text>{state.account.acct}</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

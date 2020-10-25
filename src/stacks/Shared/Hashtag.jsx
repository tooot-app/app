import React from 'react'
import { useDispatch } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native'

import Timeline from 'src/stacks/common/Timeline'
import { reset } from 'src/stacks/common/timelineSlice'

// Show remote hashtag? Only when private, show local version?

export default function Hashtag ({
  route: {
    params: { hashtag }
  }
}) {
  const dispatch = useDispatch()

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused

      return () => {
        dispatch(reset('Hashtag'))
      }
    }, [])
  )

  return <Timeline page='Hashtag' hashtag={hashtag} />
}

import { useEffect, useState } from 'react'
import { FormattedRelativeTime } from 'react-intl'
import { AppState } from 'react-native'

export interface Props {
  time: string | number
}

const RelativeTime: React.FC<Props> = ({ time }) => {
  const [now, setNow] = useState(new Date().getTime())
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', state => {
      setNow(new Date().getTime())
    })

    return () => {
      appStateListener.remove()
    }
  }, [])

  return (
    <FormattedRelativeTime
      value={(new Date(time).getTime() - now) / 1000}
      updateIntervalInSeconds={1}
    />
  )
}

export default RelativeTime

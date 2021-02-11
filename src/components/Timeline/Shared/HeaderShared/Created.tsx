import RelativeTime from '@components/RelativeTime'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet, Text } from 'react-native'

export interface Props {
  created_at: Mastodon.Status['created_at'] | number
}

const HeaderSharedCreated = React.memo(
  ({ created_at }: Props) => {
    const { theme } = useTheme()

    return (
      <Text style={[styles.created_at, { color: theme.secondary }]}>
        <RelativeTime date={created_at} />
      </Text>
    )
  },
  () => true
)

const styles = StyleSheet.create({
  created_at: {
    ...StyleConstants.FontStyle.S
  }
})

export default HeaderSharedCreated

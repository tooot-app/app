import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet } from 'react-native'

export interface Props {
  visibility: Mastodon.Status['visibility']
}

const HeaderSharedVisibility = React.memo(
  ({ visibility }: Props) => {
    const { theme } = useTheme()

    switch (visibility) {
      case 'private':
        return (
          <Icon
            name='Lock'
            size={StyleConstants.Font.Size.S}
            color={theme.secondary}
            style={styles.visibility}
          />
        )
      case 'direct':
        return (
          <Icon
            name='Mail'
            size={StyleConstants.Font.Size.S}
            color={theme.secondary}
            style={styles.visibility}
          />
        )
      default:
        return null
    }
  },
  () => true
)

const styles = StyleSheet.create({
  visibility: {
    marginLeft: StyleConstants.Spacing.S
  }
})

export default HeaderSharedVisibility

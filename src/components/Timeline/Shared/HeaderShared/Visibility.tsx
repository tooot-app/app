import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'

export interface Props {
  visibility: Mastodon.Status['visibility']
}

const HeaderSharedVisibility = React.memo(
  ({ visibility }: Props) => {
    const { t } = useTranslation('componentTimeline')
    const { colors } = useTheme()

    switch (visibility) {
      case 'public':
        return (
          <Icon
            accessibilityLabel={t(
              'shared.header.shared.visibility.private.accessibilityLabel'
            )}
            name='Globe'
            size={StyleConstants.Font.Size.S}
            color={colors.secondary}
            style={styles.visibility}
          />
        )
      case 'unlisted':
        return (
          <Icon
            accessibilityLabel={t(
              'shared.header.shared.visibility.private.accessibilityLabel'
            )}
            name='Unlock'
            size={StyleConstants.Font.Size.S}
            color={colors.secondary}
            style={styles.visibility}
          />
        )
      case 'private':
        return (
          <Icon
            accessibilityLabel={t(
              'shared.header.shared.visibility.private.accessibilityLabel'
            )}
            name='Lock'
            size={StyleConstants.Font.Size.S}
            color={colors.secondary}
            style={styles.visibility}
          />
        )
      case 'direct':
        return (
          <Icon
            accessibilityLabel={t(
              'shared.header.shared.visibility.direct.accessibilityLabel'
            )}
            name='Mail'
            size={StyleConstants.Font.Size.S}
            color={colors.secondary}
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

import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import StatusContext from '../Context'

const HeaderSharedVisibility: React.FC = () => {
  const { status } = useContext(StatusContext)
  const { t } = useTranslation('componentTimeline')
  const { colors } = useTheme()

  switch (status?.visibility) {
    case 'unlisted':
      return (
        <Icon
          accessibilityLabel={t('shared.header.shared.visibility.private.accessibilityLabel')}
          name='Unlock'
          size={StyleConstants.Font.Size.S}
          color={colors.secondary}
          style={styles.visibility}
        />
      )
    case 'private':
      return (
        <Icon
          accessibilityLabel={t('shared.header.shared.visibility.private.accessibilityLabel')}
          name='Lock'
          size={StyleConstants.Font.Size.S}
          color={colors.secondary}
          style={styles.visibility}
        />
      )
    case 'direct':
      return (
        <Icon
          accessibilityLabel={t('shared.header.shared.visibility.direct.accessibilityLabel')}
          name='Mail'
          size={StyleConstants.Font.Size.S}
          color={colors.secondary}
          style={styles.visibility}
        />
      )
    default:
      return null
  }
}

const styles = StyleSheet.create({
  visibility: {
    marginLeft: StyleConstants.Spacing.S
  }
})

export default HeaderSharedVisibility

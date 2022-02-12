import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'

export interface Props {
  muted?: Mastodon.Status['muted']
}

const HeaderSharedMuted = React.memo(
  ({ muted }: Props) => {
    const { t } = useTranslation('componentTimeline')
    const { colors } = useTheme()

    return muted ? (
      <Icon
        accessibilityLabel={t('shared.header.shared.muted.accessibilityLabel')}
        name='VolumeX'
        size={StyleConstants.Font.Size.S}
        color={colors.secondary}
        style={styles.visibility}
      />
    ) : null
  },
  () => true
)

const styles = StyleSheet.create({
  visibility: {
    marginLeft: StyleConstants.Spacing.S
  }
})

export default HeaderSharedMuted

import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'

export interface Props {
  muted?: Mastodon.Status['muted']
}

const HeaderSharedMuted: React.FC<Props> = ({ muted }) => {
  const { t } = useTranslation('componentTimeline')
  const { colors } = useTheme()

  return muted ? (
    <Icon
      accessibilityLabel={t('shared.header.shared.muted.accessibilityLabel')}
      name='VolumeX'
      size={StyleConstants.Font.Size.M}
      color={colors.secondary}
      style={{ marginLeft: StyleConstants.Spacing.S }}
    />
  ) : null
}

export default HeaderSharedMuted

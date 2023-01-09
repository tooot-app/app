import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import StatusContext from '../Context'

const HeaderSharedMuted: React.FC = () => {
  const { status } = useContext(StatusContext)
  const { t } = useTranslation('componentTimeline')
  const { colors } = useTheme()

  return status?.muted ? (
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

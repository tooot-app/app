import openLink from '@components/openLink'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'

export interface Props {
  application?: Mastodon.Application
}

const HeaderSharedApplication: React.FC<Props> = ({ application }) => {
  const { colors } = useTheme()
  const { t } = useTranslation('componentTimeline')

  return application && application.name !== 'Web' ? (
    <CustomText
      fontStyle='S'
      accessibilityRole='link'
      onPress={async () => {
        application.website && (await openLink(application.website))
      }}
      style={{
        marginLeft: StyleConstants.Spacing.S,
        color: colors.secondary
      }}
      numberOfLines={1}
    >
      {t('shared.header.shared.application', {
        application: application.name
      })}
    </CustomText>
  ) : null
}

export default HeaderSharedApplication

import openLink from '@components/openLink'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import StatusContext from '../Context'

const HeaderSharedApplication: React.FC = () => {
  const { status } = useContext(StatusContext)
  const { colors } = useTheme()
  const { t } = useTranslation('componentTimeline')

  return status?.application?.name && status.application.name !== 'Web' ? (
    <CustomText
      fontStyle='S'
      accessibilityRole='link'
      onPress={async () => {
        status.application?.website && (await openLink(status.application.website))
      }}
      style={{
        flex: 1,
        marginLeft: StyleConstants.Spacing.S,
        color: colors.secondary
      }}
      numberOfLines={1}
    >
      {t('shared.header.shared.application', {
        application: status.application.name
      })}
    </CustomText>
  ) : null
}

export default HeaderSharedApplication

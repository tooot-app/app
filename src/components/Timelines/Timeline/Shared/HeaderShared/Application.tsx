import analytics from '@components/analytics'
import openLink from '@components/openLink'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text } from 'react-native'

export interface Props {
  application?: Mastodon.Application
}

const HeaderSharedApplication: React.FC<Props> = ({ application }) => {
  const { theme } = useTheme()
  const { t } = useTranslation('componentTimeline')

  return application && application.name !== 'Web' ? (
    <Text
      onPress={async () => {
        analytics('timeline_shared_header_application_press', {
          application
        })
        application.website && (await openLink(application.website))
      }}
      style={[styles.application, { color: theme.secondary }]}
    >
      {t('shared.header.shared.application', { application: application.name })}
    </Text>
  ) : null
}

const styles = StyleSheet.create({
  application: {
    ...StyleConstants.FontStyle.S,
    marginLeft: StyleConstants.Spacing.S
  }
})

export default HeaderSharedApplication

import analytics from '@components/analytics'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

export interface Props {
  status: Mastodon.Status
  highlighted: boolean
}

const TimelineActionsUsers = React.memo(
  ({ status, highlighted }: Props) => {
    if (!highlighted) {
      return null
    }

    const { t } = useTranslation('componentTimeline')
    const { theme } = useTheme()
    const navigation = useNavigation<
      StackNavigationProp<Nav.TabLocalStackParamList>
    >()

    return (
      <View style={styles.base}>
        {status.reblogs_count > 0 ? (
          <Text
            accessibilityLabel={t(
              'shared.actionsUsers.reblogged_by.accessibilityLabel',
              {
                count: status.reblogs_count
              }
            )}
            accessibilityHint={t(
              'shared.actionsUsers.reblogged_by.accessibilityHint'
            )}
            accessibilityRole='button'
            style={[styles.text, { color: theme.blue }]}
            onPress={() => {
              analytics('timeline_shared_actionsusers_press_boosted', {
                count: status.reblogs_count
              })
              navigation.push('Tab-Shared-Users', {
                reference: 'statuses',
                id: status.id,
                type: 'reblogged_by',
                count: status.reblogs_count
              })
            }}
          >
            {t('shared.actionsUsers.reblogged_by.text', {
              count: status.reblogs_count
            })}
          </Text>
        ) : null}
        {status.favourites_count > 0 ? (
          <Text
            accessibilityLabel={t(
              'shared.actionsUsers.favourited_by.accessibilityLabel',
              {
                count: status.reblogs_count
              }
            )}
            accessibilityHint={t(
              'shared.actionsUsers.favourited_by.accessibilityHint'
            )}
            accessibilityRole='button'
            style={[styles.text, { color: theme.blue }]}
            onPress={() => {
              analytics('timeline_shared_actionsusers_press_boosted', {
                count: status.favourites_count
              })
              navigation.push('Tab-Shared-Users', {
                reference: 'statuses',
                id: status.id,
                type: 'favourited_by',
                count: status.favourites_count
              })
            }}
          >
            {t('shared.actionsUsers.favourited_by.text', {
              count: status.favourites_count
            })}
          </Text>
        ) : null}
      </View>
    )
  },
  (prev, next) =>
    prev.status.reblogs_count === next.status.reblogs_count &&
    prev.status.favourites_count === next.status.favourites_count
)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row'
  },
  text: {
    ...StyleConstants.FontStyle.M,
    padding: StyleConstants.Spacing.S,
    paddingLeft: 0,
    marginRight: StyleConstants.Spacing.S
  }
})

export default TimelineActionsUsers

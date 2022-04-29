import analytics from '@components/analytics'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { useStatusHistory } from '@utils/queryHooks/statusesHistory'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

export interface Props {
  status: Mastodon.Status
  highlighted: boolean
}

const TimelineFeedback = React.memo(
  ({ status, highlighted }: Props) => {
    if (!highlighted) {
      return null
    }

    const { t } = useTranslation('componentTimeline')
    const { colors } = useTheme()
    const navigation =
      useNavigation<StackNavigationProp<TabLocalStackParamList>>()

    const { data } = useStatusHistory({
      id: status.id,
      options: { enabled: status.edited_at !== undefined }
    })

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
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
              style={[styles.text, { color: colors.blue }]}
              onPress={() => {
                analytics('timeline_shared_feedback_press_reblog', {
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
              style={[styles.text, { color: colors.blue }]}
              onPress={() => {
                analytics('timeline_shared_feedback_press_favourite', {
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
        <View>
          {data && data.length > 1 ? (
            <Text
              accessibilityLabel={t(
                'shared.actionsUsers.history.accessibilityLabel',
                {
                  count: data.length - 1
                }
              )}
              accessibilityHint={t(
                'shared.actionsUsers.history.accessibilityHint'
              )}
              accessibilityRole='button'
              style={[styles.text, { marginRight: 0, color: colors.blue }]}
              onPress={() => {
                analytics('timeline_shared_feedback_press_history', {
                  count: data.length - 1
                })
                navigation.push('Tab-Shared-History', { id: status.id })
              }}
            >
              {t('shared.actionsUsers.history.text', {
                count: data.length - 1
              })}
            </Text>
          ) : null}
        </View>
      </View>
    )
  },
  (prev, next) =>
    prev.status.reblogs_count === next.status.reblogs_count &&
    prev.status.favourites_count === next.status.favourites_count
)

const styles = StyleSheet.create({
  text: {
    ...StyleConstants.FontStyle.M,
    padding: StyleConstants.Spacing.S,
    paddingLeft: 0,
    marginRight: StyleConstants.Spacing.S
  }
})

export default TimelineFeedback

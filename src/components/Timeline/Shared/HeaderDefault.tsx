import Icon from '@components/Icon'
import { useNavigation } from '@react-navigation/native'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedMuted from './HeaderShared/Muted'
import HeaderSharedVisibility from './HeaderShared/Visibility'

export interface Props {
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
  status: Mastodon.Status
}

const TimelineHeaderDefault = React.memo(
  ({ queryKey, rootQueryKey, status }: Props) => {
    const { t } = useTranslation('componentTimeline')
    const navigation = useNavigation()
    const { colors } = useTheme()

    return (
      <View style={styles.base}>
        <View style={styles.accountAndMeta}>
          <HeaderSharedAccount account={status.account} />
          <View style={styles.meta}>
            <HeaderSharedCreated created_at={status.created_at} />
            <HeaderSharedVisibility visibility={status.visibility} />
            <HeaderSharedMuted muted={status.muted} />
            <HeaderSharedApplication application={status.application} />
          </View>
        </View>

        {queryKey ? (
          <Pressable
            accessibilityHint={t('shared.header.actions.accessibilityHint')}
            style={styles.action}
            onPress={() =>
              navigation.navigate('Screen-Actions', {
                queryKey,
                rootQueryKey,
                status,
                url: status.url || status.uri,
                type: 'status'
              })
            }
            children={
              <Icon
                name='MoreHorizontal'
                color={colors.secondary}
                size={StyleConstants.Font.Size.L}
              />
            }
          />
        ) : null}
      </View>
    )
  },
  () => true
)

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row'
  },
  accountAndMeta: {
    flex: 5
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: StyleConstants.Spacing.XS,
    marginBottom: StyleConstants.Spacing.S
  },
  created_at: {
    ...StyleConstants.FontStyle.S
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: StyleConstants.Spacing.S
  }
})

export default TimelineHeaderDefault

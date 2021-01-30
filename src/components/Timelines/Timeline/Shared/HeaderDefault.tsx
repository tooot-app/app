import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedVisibility from './HeaderShared/Visibility'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import HeaderSharedMuted from './HeaderShared/Muted'
import { useNavigation } from '@react-navigation/native'
import Icon from '@components/Icon'
import { useTheme } from '@utils/styles/ThemeManager'

export interface Props {
  queryKey?: QueryKeyTimeline
  status: Mastodon.Status
}

const TimelineHeaderDefault: React.FC<Props> = ({ queryKey, status }) => {
  const navigation = useNavigation()
  const { theme } = useTheme()

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
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            paddingBottom: StyleConstants.Spacing.S
          }}
          onPress={() =>
            navigation.navigate('Screen-Actions', {
              queryKey,
              status,
              url: status.url || status.uri,
              type: 'status'
            })
          }
          children={
            <Icon
              name='MoreHorizontal'
              color={theme.secondary}
              size={StyleConstants.Font.Size.L}
            />
          }
        />
      ) : null}
    </View>
  )
}

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
  }
})

export default React.memo(
  TimelineHeaderDefault,
  (prev, next) => prev.status.muted !== next.status.muted
)

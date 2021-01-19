import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedVisibility from './HeaderShared/Visibility'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import HeaderSharedMuted from './HeaderShared/Muted'
import HeaderActions from './HeaderActions/Root'

export interface Props {
  queryKey?: QueryKeyTimeline
  status: Mastodon.Status
}

const TimelineHeaderDefault: React.FC<Props> = ({ queryKey, status }) => {
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
        <HeaderActions
          queryKey={queryKey}
          status={status}
          url={status.url || status.uri}
          type='status'
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
    flex: 4
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

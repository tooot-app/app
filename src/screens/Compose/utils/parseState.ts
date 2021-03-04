import { store } from '@root/store'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import composeInitialState from './initialState'
import { ComposeState } from './types'

const composeParseState = (
  params: NonNullable<Nav.RootStackParamList['Screen-Compose']>
): ComposeState => {
  switch (params.type) {
    case 'edit':
      return {
        ...composeInitialState,
        dirty: true,
        timestamp: Date.now(),
        ...(params.incomingStatus.spoiler_text && {
          spoiler: { ...composeInitialState.spoiler, active: true }
        }),
        ...(params.incomingStatus.poll && {
          poll: {
            active: true,
            total: params.incomingStatus.poll.options.length,
            options: {
              '0': params.incomingStatus.poll.options[0]?.title || undefined,
              '1': params.incomingStatus.poll.options[1]?.title || undefined,
              '2': params.incomingStatus.poll.options[2]?.title || undefined,
              '3': params.incomingStatus.poll.options[3]?.title || undefined
            },
            multiple: params.incomingStatus.poll.multiple,
            expire: '86400' // !!!
          }
        }),
        ...(params.incomingStatus.media_attachments && {
          attachments: {
            sensitive: params.incomingStatus.sensitive,
            uploads: params.incomingStatus.media_attachments.map(media => ({
              remote: media
            }))
          }
        }),
        visibility:
          params.incomingStatus.visibility ||
          getInstanceAccount(store.getState())?.preferences[
            'posting:default:visibility'
          ] ||
          'public',
        ...(params.incomingStatus.visibility === 'direct' && {
          visibilityLock: true
        })
      }
    case 'reply':
      const actualStatus = params.incomingStatus.reblog || params.incomingStatus
      return {
        ...composeInitialState,
        dirty: true,
        timestamp: Date.now(),
        ...(actualStatus.spoiler_text && {
          spoiler: { ...composeInitialState.spoiler, active: true }
        }),
        visibility: actualStatus.visibility,
        visibilityLock: actualStatus.visibility === 'direct',
        replyToStatus: actualStatus
      }
    case 'conversation':
      return {
        ...composeInitialState,
        dirty: true,
        timestamp: Date.now(),
        visibility: 'direct',
        visibilityLock: true
      }
  }
}

export default composeParseState

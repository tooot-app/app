import { store } from '@root/store'
import { RootStackParamList } from '@utils/navigation/navigators'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import composeInitialState from './initialState'
import { ComposeState } from './types'

const assignVisibility = (
  target: ComposeState['visibility']
): Pick<ComposeState, 'visibility' | 'visibilityLock'> => {
  const accountPreference = getInstanceAccount(store.getState())?.preferences[
    'posting:default:visibility'
  ]

  switch (target) {
    case 'direct':
      return { visibility: 'direct', visibilityLock: true }
    case 'private':
      return { visibility: 'private', visibilityLock: false }
    case 'unlisted':
      if (accountPreference === 'private') {
        return { visibility: 'private', visibilityLock: false }
      } else {
        return { visibility: 'unlisted', visibilityLock: false }
      }
    case 'public':
      switch (accountPreference) {
        case 'private':
          return { visibility: 'private', visibilityLock: false }
        case 'unlisted':
          return { visibility: 'unlisted', visibilityLock: false }
        default:
          return { visibility: 'public', visibilityLock: false }
      }
  }
}

const composeParseState = (
  params: NonNullable<RootStackParamList['Screen-Compose']>
): ComposeState => {
  switch (params.type) {
    case 'edit':
    case 'deleteEdit':
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
        ...assignVisibility(params.incomingStatus.visibility),
        ...(params.replyToStatus && { replyToStatus: params.replyToStatus }),
        visibilityLock: params.type === 'edit'
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
        ...assignVisibility(actualStatus.visibility),
        replyToStatus: actualStatus
      }
    case 'conversation':
      return {
        ...composeInitialState,
        dirty: true,
        timestamp: Date.now(),
        ...assignVisibility('direct')
      }
  }
}

export default composeParseState

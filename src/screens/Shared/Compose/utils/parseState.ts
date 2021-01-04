import { store } from '@root/store'
import { getLocalAccountPreferences } from '@utils/slices/instancesSlice'
import composeInitialState from './initialState'
import { ComposeState } from './types'

export interface Props {
  type: 'reply' | 'conversation' | 'edit'
  incomingStatus: Mastodon.Status
}

const composeParseState = ({ type, incomingStatus }: Props): ComposeState => {
  switch (type) {
    case 'edit':
      return {
        ...composeInitialState,
        ...(incomingStatus.spoiler_text && {
          spoiler: { ...composeInitialState.spoiler, active: true }
        }),
        ...(incomingStatus.poll && {
          poll: {
            active: true,
            total: incomingStatus.poll.options.length,
            options: {
              '0': incomingStatus.poll.options[0]?.title || undefined,
              '1': incomingStatus.poll.options[1]?.title || undefined,
              '2': incomingStatus.poll.options[2]?.title || undefined,
              '3': incomingStatus.poll.options[3]?.title || undefined
            },
            multiple: incomingStatus.poll.multiple,
            expire: '86400' // !!!
          }
        }),
        ...(incomingStatus.media_attachments && {
          attachments: {
            sensitive: incomingStatus.sensitive,
            uploads: incomingStatus.media_attachments.map(media => ({
              remote: media
            }))
          }
        }),
        visibility:
          incomingStatus.visibility ||
          getLocalAccountPreferences(store.getState())[
            'posting:default:visibility'
          ],
        ...(incomingStatus.visibility === 'direct' && { visibilityLock: true })
      }
    case 'reply':
      const actualStatus = incomingStatus.reblog || incomingStatus
      return {
        ...composeInitialState,
        visibility: actualStatus.visibility,
        visibilityLock: actualStatus.visibility === 'direct',
        replyToStatus: actualStatus
      }
    case 'conversation':
      return {
        ...composeInitialState,
        text: {
          count: incomingStatus.account.acct.length + 2,
          raw: `@${incomingStatus.account.acct} `,
          formatted: undefined,
          selection: { start: 0, end: 0 }
        },
        visibility: 'direct',
        visibilityLock: true
      }
  }
}

export default composeParseState

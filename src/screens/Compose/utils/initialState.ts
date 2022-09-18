import { createRef } from 'react'
import { ComposeState } from './types'

const composeInitialState: Omit<ComposeState, 'timestamp'> = {
  dirty: false,
  posting: false,
  spoiler: {
    active: false,
    count: 0,
    raw: '',
    formatted: undefined,
    selection: { start: 0 }
  },
  text: {
    count: 0,
    raw: '',
    formatted: undefined,
    selection: { start: 0 }
  },
  tag: undefined,
  poll: {
    active: false,
    total: 2,
    options: {
      '0': undefined,
      '1': undefined,
      '2': undefined,
      '3': undefined
    },
    multiple: false,
    expire: '86400'
  },
  attachments: {
    sensitive: false,
    uploads: []
  },
  visibility: 'public',
  visibilityLock: false,
  replyToStatus: undefined,
  textInputFocus: {
    current: 'text',
    refs: { text: createRef() }
  }
}

export default composeInitialState

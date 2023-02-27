import { createRef } from 'react'
import { ComposeState } from './types'

const composeInitialState: Omit<ComposeState, 'timestamp'> = {
  type: undefined,
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
    options: [],
    multiple: false,
    expire: '86400'
  },
  attachments: {
    sensitive: false,
    uploads: [
      // Test images
      // {
      //   remote: {
      //     id: '01',
      //     type: 'image',
      //     url: 'https://images.unsplash.com/photo-1669311540088-8d44f4ab2cd7',
      //     preview_url: 'https://images.unsplash.com/photo-1669311540088-8d44f4ab2cd7'
      //   },
      //   local: undefined,
      //   uploading: false
      // },
      // {
      //   remote: {
      //     id: '02',
      //     type: 'image',
      //     url: 'https://images.unsplash.com/photo-1669311605888-07172f42cb35',
      //     preview_url: 'https://images.unsplash.com/photo-1669311605888-07172f42cb35'
      //   },
      //   local: undefined,
      //   uploading: false
      // },
      // {
      //   remote: {
      //     id: '03',
      //     type: 'image',
      //     url: 'https://images.unsplash.com/photo-1669311576866-d77abb31f4ce',
      //     preview_url: 'https://images.unsplash.com/photo-1669311576866-d77abb31f4ce'
      //   },
      //   local: undefined,
      //   uploading: false
      // }
    ]
  },
  visibility: 'public',
  visibilityLock: false,
  replyToStatus: undefined,
  textInputFocus: {
    current: 'text',
    refs: { text: createRef(), spoiler: createRef() },
    isFocused: { text: createRef(), spoiler: createRef() }
  }
}

export default composeInitialState

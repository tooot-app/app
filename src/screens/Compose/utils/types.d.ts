export type ExtendedAttachment = {
  remote?: Mastodon.Attachment
  local?: App.IImageInfo & { local_thumbnail?: string; hash?: string }
  uploading?: boolean
}

export type ComposeStateDraft = {
  timestamp: number
  spoiler?: string
  text?: string
  poll?: ComposeState['poll']
  attachments?: ComposeState['attachments']
  visibility: ComposeState['visibility']
  visibilityLock: ComposeState['visibilityLock']
  replyToStatus?: ComposeState['replyToStatus']
}

export type ComposeState = {
  dirty: boolean
  timestamp: number
  posting: boolean
  spoiler: {
    active: boolean
    count: number
    raw: string
    formatted: ReactNode
    selection: { start: number; end: number }
  }
  text: {
    count: number
    raw: string
    formatted: ReactNode
    selection: { start: number; end: number }
  }
  tag?: {
    type: 'url' | 'accounts' | 'hashtags'
    text: string
    offset: number
    length: number
  }
  emoji: {
    active: boolean
    emojis: { title: string; data: Mastodon.Emoji[] }[] | undefined
  }
  poll: {
    active: boolean
    total: number
    options: {
      '0': string | undefined
      '1': string | undefined
      '2': string | undefined
      '3': string | undefined
    }
    multiple: boolean
    expire: '300' | '1800' | '3600' | '21600' | '86400' | '259200' | '604800'
  }
  attachments: {
    sensitive: boolean
    uploads: ExtendedAttachment[]
  }
  visibility: 'public' | 'unlisted' | 'private' | 'direct'
  visibilityLock: boolean
  replyToStatus?: Mastodon.Status
  textInputFocus: {
    current: 'text' | 'spoiler'
    refs: { text: RefObject<TextInput>; spoiler: RefObject<TextInput> }
  }
}

export type ComposeAction =
  | {
      type: 'loadDraft'
      payload: ComposeStateDraft
    }
  | {
      type: 'dirty'
      payload: ComposeState['dirty']
    }
  | {
      type: 'posting'
      payload: ComposeState['posting']
    }
  | {
      type: 'spoiler'
      payload: Partial<ComposeState['spoiler']>
    }
  | {
      type: 'text'
      payload: Partial<ComposeState['text']>
    }
  | {
      type: 'tag'
      payload: ComposeState['tag']
    }
  | {
      type: 'emoji'
      payload: ComposeState['emoji']
    }
  | {
      type: 'poll'
      payload: Partial<ComposeState['poll']>
    }
  | {
      type: 'attachments/sensitive'
      payload: Pick<ComposeState['attachments'], 'sensitive'>
    }
  | {
      type: 'attachment/upload/start'
      payload: Pick<ExtendedAttachment, 'local' | 'uploading'>
    }
  | {
      type: 'attachment/upload/end'
      payload: { remote: Mastodon.Attachment; local: ImageInfo }
    }
  | {
      type: 'attachment/upload/fail'
      payload: ExtendedAttachment['local']['hash']
    }
  | {
      type: 'attachment/delete'
      payload: NonNullable<ExtendedAttachment['remote']>['id']
    }
  | {
      type: 'attachment/edit'
      payload: ExtendedAttachment['remote']
    }
  | {
      type: 'visibility'
      payload: ComposeState['visibility']
    }
  | {
      type: 'textInputFocus'
      payload: Partial<ComposeState['textInputFocus']>
    }

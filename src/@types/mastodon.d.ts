declare namespace Mastodon {
  type Account = {
    // Base
    id: string
    username: string
    acct: string
    url: string

    // Attributes
    display_name: string
    note?: string
    avatar: string
    avatar_static: string
    header: string
    header_static: string
    locked: boolean
    emojis?: Emoji[]
    discoverable: boolean

    // Statistics
    created_at: string
    last_status_at: string
    statuses_count: number
    followers_count: number
    following_count: number

    // Others
    moved?: Status
    fields: Field[]
    bot: boolean
    source: Source
  }

  type Announcement = {
    // Base
    id: string
    content: string
    all_day: boolean
    published_at: string
    updated_at: string
    read: boolean

    // Others
    scheduled_at?: string
    starts_at?: string
    ends_at?: string
    reactions?: AnnouncementReaction[]
    mentions?: Mention[]
    statuses?: Status[]
    tags?: Tag[]
    emojis?: Emoji[]
  }

  type AnnouncementReaction = {
    // Base
    name: string
    count: number
    me: boolean
    url: string
    static_url: string
  }

  type Application = {
    // Base
    name: string
    website?: string
    vapid_key?: string
  }

  type AppOauth = {
    id: string
    name: string
    website?: string
    redirect_uri: string
    client_id: string
    client_secret: string
    vapid_key: string
  }

  type Attachment =
    | AttachmentImage
    | AttachmentVideo
    | AttachmentGifv
    | AttachmentAudio
  // | AttachmentUnknown

  type AttachmentImage = {
    // Base
    id: string
    type: 'image'
    url: string
    preview_url: string

    // Others
    remote_url?: string
    text_url?: string
    meta?: {
      original?: { width: number; height: number; size: string; aspect: number }
      small?: { width: number; height: number; size: string; aspect: number }
      focus?: { x: number; y: number }
    }
    description?: string
    blurhash?: string
  }

  type AttachmentVideo = {
    // Base
    id: string
    type: 'video'
    url: string
    preview_url: string

    // Others
    remote_url?: string
    text_url?: string
    meta?: {
      length: string
      duration: number
      fps: number
      size: string
      width: number
      height: number
      aspect: number
      audio_encode: string
      audio_bitrate: string
      audio_channels: string
      original: {
        width: number
        height: number
        frame_rate: string
        duration: number
        bitrate: number
      }
      small: {
        width: number
        height: number
        size: string
        aspect: number
      }
    }
    description?: string
    blurhash?: string
  }

  type AttachmentGifv = {
    // Base
    id: string
    type: 'gifv'
    url: string
    preview_url: string

    // Others
    remote_url?: string
    text_url?: string
    meta?: {
      length: string
      duration: number
      fps: number
      size: string
      width: number
      height: number
      aspect: number
      original: {
        width: number
        height: number
        frame_rate: string
        duration: number
        bitrate: number
      }
      small: {
        width: number
        height: number
        size: string
        aspect: number
      }
    }
    description?: string
    blurhash?: string
  }

  type AttachmentAudio = {
    // Base
    id: string
    type: 'audio'
    url: string
    preview_url: string

    // Others
    remote_url?: string
    text_url?: string
    meta?: {
      length: string
      duration: number
      audio_encode: string
      audio_bitrate: string
      audio_channels: string
      original: {
        duration: number
        bitrate: number
      }
    }
    description?: string
    blurhash?: string
  }

  // type AttachmentUnknown = {
  //   // Base
  //   id: string
  //   type: 'unknown'
  //   url: string
  //   preview_url: string

  //   // Others
  //   remote_url?: string
  //   text_url?: string
  //   meta?: any
  //   description?: string
  //   blurhash?: string
  // }

  type Card = {
    // Base
    url: string
    title: string
    description: string
    type: 'link' | 'photo' | 'video' | 'rich'

    // Attributes
    author_name: string
    author_url: string
    provider_name: string
    provider_url: string
    html: string
    width: number
    height: number
    image: string
    embed_url: string
    blurhash: string
  }

  type Conversation = {
    id: string
    accounts: Account[]
    unread: boolean
    last_status?: Status
  }

  type Emoji = {
    // Base
    shortcode: string
    url: string
    static_url: string
    visible_in_picker: boolean
    category?: string
  }

  type Field = {
    name: string
    value: string
    verified_at?: string
  }

  type List = {
    id: string
    title: string
  }

  type Instance = {
    // Base
    uri: string
    title: string
    description: string
    short_description: string
    email: string
    version: string
    languages: string[]
    registrations: boolean
    approval_required: boolean
    invites_enabled: boolean
    urls: {
      streaming_api: string
    }
    stats: {
      user_count: number
      status_count: number
      domain_count: number
    }

    // Others
    thumbnail?: string
    contact_account?: Account
  }

  type Mention = {
    // Base
    id: string
    username: string
    acct: string
    url: string
  }

  type Notification = {
    // Base
    id: string
    type: 'follow' | 'mention' | 'reblog' | 'favourite' | 'poll'
    created_at: string
    account: Account

    // Others
    status?: Status
  }

  type Poll = {
    // Base
    id: string
    expires_at: string
    expired: boolean
    multiple: bool
    votes_count: number
    voters_count: number
    voted?: boolean
    own_votes?: number[]
    options: { title: string; votes_count: number }[]
    emojis: Emoji[]
  }

  type Preferences = {
    'posting:default:visibility'?: 'public' | 'unlisted' | 'private' | 'direct'
    'posting:default:sensitive'?: boolean
    'posting:default:language'?: string
    'reading:expand:media'?: 'default' | 'show_all' | 'hide_all'
    'reading:expand:spoilers'?: boolean
  }

  type Relationship = {
    id: string
    following: boolean
    showing_reblogs: boolean
    followed_by: boolean
    blocking: boolean
    blocked_by: boolean
    muting: boolean
    muting_notifications: boolean
    requested: boolean
    domain_blocking: boolean
    endorsed: boolean
    note: string
  }

  type Results = {
    accounts?: Account[]
    statuses?: Status[]
    hashtags?: Tag[]
  }

  type Status = {
    // Base
    id: string
    uri: string
    created_at: string
    account: Account
    content: string
    visibility: 'public' | 'unlisted' | 'private' | 'direct'
    sensitive: boolean
    spoiler_text?: string
    media_attachments: Attachment[]
    application: Application

    // Attributes
    mentions: Mention[]
    tags: Tag[]
    emojis: Emoji[]

    // Interaction
    reblogs_count: number
    favourites_count: number
    replies_count: number
    favourited: boolean
    reblogged: boolean
    muted: boolean
    bookmarked: boolean
    pinned: boolean

    // Others
    url?: string
    in_reply_to_id?: string
    in_reply_to_account_id?: string
    reblog?: Status
    poll?: Poll
    card?: Card
    language?: string
    text?: string
  }

  type Source = {
    // Base
    note: string
    fields: Field[]

    // Others
    privacy?: 'public' | 'unlisted' | 'private' | 'direct'
    sensitive?: boolean
    language?: string
    follow_requests_count?: number
  }

  type Tag = {
    // Base
    name: string
    url: string
    // history: types
  }
}

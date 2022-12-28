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
    moved?: Account
    fields: Field[]
    bot: boolean
    source?: Source
    suspended?: boolean
    role?: Role
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

  type Apps = {
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
    | AttachmentUnknown

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
    preview_remote_url?: string // undocumented
    text_url?: string
    meta: {
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

  type AttachmentUnknown = {
    // Base
    id: string
    type: 'unknown'
    url: string
    preview_url: string

    // Others
    remote_url?: string
    text_url?: string
    meta?: any
    description?: string
    blurhash?: string
  }

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
    verified_at: string | null
  }

  type Filter<T extends 'v1' | 'v2'> = T extends 'v2' ? Filter_V2 : Filter_V1
  type Filter_V2 = {
    id: string
    title: string
    context: ('home' | 'notifications' | 'public' | 'thread' | 'account')[]
    expires_at?: string
    filter_action: 'warn' | 'hide'
    keywords: FilterKeyword[]
    statuses: FilterStatus[]
  }
  type Filter_V1 = {
    id: string
    phrase: string
    context: ('home' | 'notifications' | 'public' | 'thread' | 'account')[]
    expires_at?: string
    irreversible: boolean
    whole_word: boolean
  }

  type FilterKeyword = { id: string; keyword: string; whole_word: boolean }

  type FilterStatus = { id: string; status_id: string }

  type FilterResult = {
    filter: Filter<'v2'>
    keyword_matches?: FilterKeyword['keyword'][]
    status_matches?: FilterStatus['id'][]
  }

  type List = {
    id: string
    title: string
    replies_policy: 'none' | 'list' | 'followed'
  }

  type Instance<T extends 'v1' | 'v2'> = T extends 'v2' ? Instance_V2 : Instance_V1
  type Instance_V2 = {
    domain: string
    title: string
    version: string
    source_url: string
    description: string
    usage: { users: { active_month: number } }
    thumbnail: { url: string; blurhash?: string; versions?: { '@1x'?: string; '@2x'?: string } }
    languages: string[]
    configuration: {
      urls: { streaming_api: string }
      accounts: { max_featured_tags: number }
      statuses: {
        max_characters: number
        max_media_attachments: number
        characters_reserved_per_url: number
      }
      media_attachments: {
        supported_mime_types: string[]
        image_size_limit: number
        image_matrix_limit: number
        video_size_limit: number
        video_frame_rate_limit: number
        video_matrix_limit: number
      }
      polls: {
        max_options: number
        max_characters_per_option: number
        min_expiration: number
        max_expiration: number
      }
      translation: { enabled: boolean }
      registrations: { enabled: boolean; approval_required: boolean; message?: string }
      contact: { email: string; account: Account }
      rules: Rule[]
    }
  }
  type Instance_V1 = {
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
    configuration?: {
      statuses: {
        max_characters: number
        max_media_attachments: number
        characters_reserved_per_url: number
      }
      media_attachments: {
        supported_mime_types: string[]
        image_size_limit: number
        image_matrix_limit: number
        video_size_limit: number
        video_frame_rate_limit: number
        video_matrix_limit: number
      }
      polls: {
        max_options: number
        max_characters_per_option: number
        min_expiration: number
        max_expiration: number
      }
    }
  }

  type Mention = {
    // Base
    id: string
    username: string
    acct: string
    url: string
  }

  type Notification =
    | {
        // Base
        id: string
        type: 'favourite' | 'mention' | 'poll' | 'reblog' | 'status' | 'update'
        created_at: string
        account: Account
        status: Status
        report: undefined
      }
    | {
        // Base
        id: string
        type: 'follow' | 'follow_request' | 'admin.sign_up'
        created_at: string
        account: Account
        status: undefined
        report: undefined
      }
    | {
        // Base
        id: string
        type: 'admin.report'
        created_at: string
        account: Account
        status: undefined
        report: Report
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

  type PushSubscription = {
    id: string
    endpoint: string
    alerts: {
      follow: boolean
      follow_request: boolean
      favourite: boolean
      reblog: boolean
      mention: boolean
      poll: boolean
      status: boolean
      update: boolean
      'admin.sign_up': boolean
      'admin.report': boolean
    }
    server_key: string
  }

  type Relationship = {
    id: string
    following: boolean
    showing_reblogs: boolean
    notifying?: boolean
    languages?: string[]
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

  type Report = {
    id: string
    action_taken: boolean
    action_taken_at?: string
    category: 'spam' | 'violation' | 'other'
    comment: string
    forwarded: boolean
    created_at: string
    status_ids?: string[]
    rule_ids?: string[]
    target_account: Account
  }

  type Results = {
    accounts?: Account[]
    statuses?: Status[]
    hashtags?: Tag[]
  }

  type Role = {
    // Added since 4.0
    id: string
    name: string
    color: string
    position: number
    permissions: string
    highlighted: boolean
    created_at: string
    updated_at: string
  }

  type Rule = {
    id: string
    text: string
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
    application?: Application

    // Attributes
    mentions: Mention[]
    tags: Tag[]
    emojis: Emoji[]

    // Interaction
    reblogs_count: number
    favourites_count: number
    replies_count: number
    edited_at?: string
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
    filtered?: FilterResult[]
  }

  type StatusHistory = {
    content: Status['content']
    spoiler_text: Status['spoiler_text']
    sensitive: Status['sensitive']
    created_at: Status['created_at']
    poll: Status['poll']
    account: Status['account']
    media_attachments: Status['media_attachments']
    emojis: Status['emojis']
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
    history: { day: string; accounts: string; uses: string }[]
    following: boolean // Since v4.0
  }
}

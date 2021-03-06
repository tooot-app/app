const demoStatuses = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    sensitive: false,
    visibility: 'public',
    replies_count: 9,
    reblogs_count: 15,
    favourites_count: 8,
    favourited: true,
    reblogged: false,
    muted: false,
    bookmarked: false,
    content:
      '<p>Would you like to try out this simple, beautiful and open-source mobile app for Mastodon? 😊</p>',
    reblog: null,
    application: {
      name: 'tooot',
      website: 'https://tooot.app'
    },
    account: {
      id: '999',
      username: 'tooot📱',
      acct: 'tooot@xmflsct.com',
      display_name: 'tooot📱',
      avatar_static:
        'https://avatars.githubusercontent.com/u/77554750?s=200&v=4'
    },
    media_attachments: [],
    poll: {
      id: '1',
      expires_at: new Date().setDate(new Date().getDate() + 5),
      expired: false,
      multiple: false,
      votes_count: 10,
      voters_count: null,
      voted: false,
      own_votes: null,
      options: [
        {
          title: 'I would love to!',
          votes_count: 6
        },
        {
          title: 'Why not give it a go?',
          votes_count: 4
        }
      ],
      emojis: []
    },
    mentions: []
  },
  {
    id: '2',
    created_at: new Date().setMinutes(new Date().getMinutes() - 2),
    sensitive: false,
    spoiler_text: '',
    visibility: 'public',
    replies_count: 5,
    reblogs_count: 6,
    favourites_count: 11,
    favourited: true,
    reblogged: false,
    muted: false,
    bookmarked: false,
    content:
      '<p>Mastodon is a free and open-source self-hosted social networking service. It allows anyone to host their own server node in the network, and its various separately operated user bases are federated across many different servers. These nodes are referred to as "instances" by Mastodon users.</p>',
    reblog: null,
    application: {
      name: 'Web',
      website: null
    },
    account: {
      id: '1000',
      username: 'Mastodon',
      acct: 'mastodon',
      display_name: 'Mastodon',
      avatar_static:
        'https://mastodon.social/apple-touch-icon.png'
    },
    media_attachments: [],
    card: {
      url: 'https://joinmastodon.org/',
      title: 'Giving social networking back to you - Mastodon',
      description:
        'Mastodon is an open source decentralized social network - by the people for the people. Join the federation and take back control of your social media!',
      type: 'link',
      image:
        'https://mastodon.social/apple-touch-icon.png'
    },
    mentions: []
  },
  {
    id: '3',
    created_at: '2021-01-24T09:50:00.901Z',
    spoiler_text: '',
    visibility: 'public',
    replies_count: 2,
    reblogs_count: null,
    favourites_count: 3,
    favourited: false,
    reblogged: false,
    muted: false,
    bookmarked: true,
    content:
      '<p>These servers are connected as a federated social network, allowing users from different servers to interact with each other seamlessly. Once a Mastodon server knows another Mastodon server, it "federates" with the other Mastodon server. Mastodon is a part of the wider Fediverse, allowing its users to also interact with users on different open platforms that support the same protocol, such as PeerTube and Friendica.</p>',
    reblog: null,
    application: {
      name: 'Web',
      website: null
    },
    account: {
      id: '1001',
      username: 'Fediverse',
      acct: 'fediverse',
      display_name: 'Fediverse',
      avatar_static:
        'https://e7.pngegg.com/pngimages/667/514/png-clipart-mastodon-fediverse-social-media-free-software-logo-social-media-blue-text.png'
    },
    media_attachments: [],
    mentions: []
  },
  {
    id: '4',
    created_at: '2021-01-24T08:50:00.901Z',
    sensitive: false,
    visibility: 'public',
    replies_count: 0,
    reblogs_count: 0,
    favourites_count: 0,
    favourited: true,
    reblogged: false,
    muted: false,
    bookmarked: false,
    content:
      '<p>tooot is an open source, simple mobile client for Mastodon. Focusing on your connections while being able to explore the Fediverse.</p>',
    reblog: null,
    application: {
      name: 'tooot',
      website: 'https://tooot.app'
    },
    account: {
      id: '1002',
      username: 'tooot📱',
      acct: 'tooot@xmflsct.com',
      display_name: 'tooot📱',
      avatar_static:
        'https://avatars.githubusercontent.com/u/77554750?s=200&v=4'
    },
    media_attachments: [],
    mentions: []
  },
  {
    id: '5',
    created_at: '2021-01-24T07:50:00.901Z',
    sensitive: false,
    visibility: 'public',
    replies_count: 0,
    reblogs_count: 0,
    favourites_count: 0,
    favourited: true,
    reblogged: false,
    muted: false,
    bookmarked: false,
    content:
      '<p>- tooot supports multiple accounts<br />- tooot supports browsing external instance<br />- tooot aims to support multiple languages</p>',
    reblog: null,
    application: {
      name: 'tooot',
      website: 'https://tooot.app'
    },
    account: {
      id: '1003',
      username: 'tooot📱',
      acct: 'tooot@xmflsct.com',
      display_name: 'tooot📱',
      avatar_static:
        'https://avatars.githubusercontent.com/u/77554750?s=200&v=4'
    },
    media_attachments: [],
    mentions: []
  }
]

export default demoStatuses

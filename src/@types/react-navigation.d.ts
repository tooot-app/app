declare namespace Nav {
  type RootStackParamList = {
    'Screen-Local': undefined
    'Screen-Public': undefined
    'Screen-Post': undefined
    'Screen-Notifications': undefined
    'Screen-Me': undefined
  }

  type SharedStackParamList = {
    'Screen-Shared-Account': {
      account: Pick<Mastodon.Account, 'id' | 'username' | 'acct' | 'url'>
    }
    'Screen-Shared-Announcements': { showAll?: boolean }
    'Screen-Shared-Compose':
      | {
          type: 'reply' | 'conversation' | 'edit'
          incomingStatus: Mastodon.Status
          queryKey?: [
            'Timeline',
            {
              page: App.Pages
              hashtag?: Mastodon.Tag['name']
              list?: Mastodon.List['id']
              toot?: Mastodon.Status['id']
              account?: Mastodon.Account['id']
            }
          ]
        }
      | undefined
    'Screen-Shared-Hashtag': {
      hashtag: Mastodon.Tag['name']
    }
    'Screen-Shared-ImagesViewer': {
      imageUrls: (IImageInfo & {
        preview_url: Mastodon.AttachmentImage['preview_url']
        remote_url: Mastodon.AttachmentImage['remote_url']
        imageIndex: number
      })[]
      imageIndex: number
    }
    'Screen-Shared-Relationships': {
      account: Mastodon.Account
      initialType: 'following' | 'followers'
    }
    'Screen-Shared-Search': undefined
    'Screen-Shared-Toot': {
      toot: Mastodon.Status
    }
  }

  type LocalStackParamList = {
    'Screen-Local-Root': undefined
  } & SharedStackParamList

  type RemoteStackParamList = {
    'Screen-Remote-Root': undefined
  } & SharedStackParamList

  type NotificationsStackParamList = {
    'Screen-Notifications-Root': undefined
  } & SharedStackParamList

  type MeStackParamList = {
    'Screen-Me-Root': { navigateAway?: 'Screen-Me-Settings-UpdateRemote' }
    'Screen-Me-Bookmarks': undefined
    'Screen-Me-Conversations': undefined
    'Screen-Me-Favourites': undefined
    'Screen-Me-Lists': undefined
    'Screen-Me-Lists-List': undefined
    'Screen-Me-Settings': undefined
    'Screen-Me-Settings-UpdateRemote': undefined
    'Screen-Me-Switch': undefined
  } & SharedStackParamList
}

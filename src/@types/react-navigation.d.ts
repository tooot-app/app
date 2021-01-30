interface IImageInfo {
  url: string
  width?: number
  height?: number
  originUrl?: string
  props?: any
}

declare namespace Nav {
  type RootStackParamList = {
    'Screen-Tabs': undefined
    'Screen-Actions': {
      queryKey: QueryKeyTimeline
      status: Mastodon.Status
      url?: string
      type?: 'status' | 'account'
    }
    'Screen-Announcements': { showAll: boolean }
    'Screen-Compose':
      | {
          type: 'edit'
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
      | {
          type: 'reply'
          incomingStatus: Mastodon.Status
          accts: Mastodon.Account['acct'][]
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
      | {
          type: 'conversation'
          accts: Mastodon.Account['acct'][]
        }
      | undefined
    'Screen-ImagesViewer': {
      imageUrls: (IImageInfo & {
        preview_url: Mastodon.AttachmentImage['preview_url']
        remote_url?: Mastodon.AttachmentImage['remote_url']
        imageIndex: number
      })[]
      imageIndex: number
    }
  }

  type ScreenTabsStackParamList = {
    'Tab-Local': undefined
    'Tab-Public': undefined
    'Tab-Compose': undefined
    'Tab-Notifications': undefined
    'Tab-Me': undefined
  }

  type TabSharedStackParamList = {
    'Tab-Shared-Account': {
      account: Mastodon.Account | Mastodon.Mention
    }
    'Tab-Shared-Attachments': { account: Mastodon.Account }
    'Tab-Shared-Hashtag': {
      hashtag: Mastodon.Tag['name']
    }
    'Tab-Shared-Relationships': {
      account: Mastodon.Account
      initialType: 'following' | 'followers'
    }
    'Tab-Shared-Search': undefined
    'Tab-Shared-Toot': {
      toot: Mastodon.Status
    }
  }

  type TabLocalStackParamList = {
    'Tab-Local-Root': undefined
  } & TabSharedStackParamList

  type TabPublicStackParamList = {
    'Tab-Public-Root': undefined
  } & TabSharedStackParamList

  type TabComposeStackParamList = {
    'Tab-Compose-Root': undefined
    'Tab-Compose-EditAttachment': unknown
  }

  type TabNotificationsStackParamList = {
    'Tab-Notifications-Root': undefined
  } & TabSharedStackParamList

  type TabMeStackParamList = {
    'Tab-Me-Root': undefined
    'Tab-Me-Bookmarks': undefined
    'Tab-Me-Conversations': undefined
    'Tab-Me-Favourites': undefined
    'Tab-Me-Lists': undefined
    'Tab-Me-Lists-List': {
      list: Mastodon.List['id']
      title: Mastodon.List['title']
    }
    'Tab-Me-Settings': undefined
    'Tab-Me-Settings-UpdateRemote': undefined
    'Tab-Me-Switch': undefined
  } & TabSharedStackParamList
}

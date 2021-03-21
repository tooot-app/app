declare namespace Nav {
  import { QueryKeyTimeline } from '@utils/queryHooks/timeline'

  type RootStackParamList = {
    'Screen-Tabs': undefined
    'Screen-Actions':
      | {
          type: 'status'
          queryKey: QueryKeyTimeline
          rootQueryKey?: QueryKeyTimeline
          status: Mastodon.Status
        }
      | {
          type: 'account'
          account: Mastodon.Account
        }
      | {
          type: 'notifications_filter'
        }
    'Screen-Announcements': { showAll: boolean }
    'Screen-Compose':
      | {
          type: 'edit'
          incomingStatus: Mastodon.Status
          replyToStatus?: Mastodon.Status
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
      imageUrls: {
        id: Mastodon.Attachment['id']
        url: Mastodon.AttachmentImage['url']
        width?: number
        height?: number
        remote_url?: Mastodon.AttachmentImage['remote_url']
      }[]
      id: Mastodon.Attachment['id']
    }
  }

  type ScreenComposeStackParamList = {
    'Screen-Compose-Root': undefined
    'Screen-Compose-EditAttachment': { index: number }
    'Screen-Compose-DraftsList': { timestamp: number }
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
    'Tab-Shared-Search': { text: string | undefined }
    'Tab-Shared-Toot': {
      toot: Mastodon.Status
      rootQueryKey?: QueryKeyTimeline
    }
    'Tab-Shared-Users':
      | {
          reference: 'accounts'
          id: Mastodon.Account['id']
          type: 'following' | 'followers'
          count: number
        }
      | {
          reference: 'statuses'
          id: Mastodon.Status['id']
          type: 'reblogged_by' | 'favourited_by'
          count: number
        }
  }

  type TabLocalStackParamList = {
    'Tab-Local-Root': undefined
  } & TabSharedStackParamList

  type TabPublicStackParamList = {
    'Tab-Public-Root': undefined
  } & TabSharedStackParamList

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
    'Tab-Me-Settings-Fontsize': undefined
    'Tab-Me-Settings-Push': undefined
    'Tab-Me-Switch': undefined
  } & TabSharedStackParamList
}

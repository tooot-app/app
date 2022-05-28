import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { NavigatorScreenParams } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { StackNavigationProp } from '@react-navigation/stack'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'

export type RootStackParamList = {
  'Screen-Tabs': NavigatorScreenParams<ScreenTabsStackParamList>
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
        queryKey?: QueryKeyTimeline
        rootQueryKey?: QueryKeyTimeline
      }
    | {
        type: 'deleteEdit'
        incomingStatus: Mastodon.Status
        replyToStatus?: Mastodon.Status
        queryKey?: QueryKeyTimeline
      }
    | {
        type: 'reply'
        incomingStatus: Mastodon.Status
        accts: Mastodon.Account['acct'][]
        queryKey?: QueryKeyTimeline
      }
    | {
        type: 'conversation'
        accts: Mastodon.Account['acct'][]
      }
    | {
        type: 'share'
        text?: string
        images?: { type: string; uri: string }[]
        video?: { type: string; uri: string }
      }
    | undefined
  'Screen-ImagesViewer': {
    imageUrls: {
      id: Mastodon.Attachment['id']
      preview_url: Mastodon.AttachmentImage['preview_url']
      url: Mastodon.AttachmentImage['url']
      remote_url?: Mastodon.AttachmentImage['remote_url']
      blurhash: Mastodon.AttachmentImage['blurhash']
      width?: number
      height?: number
    }[]
    id: Mastodon.Attachment['id']
  }
}
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>

export type ScreenComposeStackParamList = {
  'Screen-Compose-Root': undefined
  'Screen-Compose-EditAttachment': { index: number }
  'Screen-Compose-DraftsList': { timestamp: number }
}
export type ScreenComposeStackScreenProps<
  T extends keyof ScreenComposeStackParamList
> = NativeStackScreenProps<ScreenComposeStackParamList, T>

export type ScreenTabsStackParamList = {
  'Tab-Local': NavigatorScreenParams<TabLocalStackParamList>
  'Tab-Public': NavigatorScreenParams<TabPublicStackParamList>
  'Tab-Compose': undefined
  'Tab-Notifications': NavigatorScreenParams<TabNotificationsStackParamList>
  'Tab-Me': NavigatorScreenParams<TabMeStackParamList>
}
export type ScreenTabsScreenProps<T extends keyof ScreenTabsStackParamList> =
  BottomTabScreenProps<ScreenTabsStackParamList, T>

export type TabSharedStackParamList = {
  'Tab-Shared-Account': {
    account: Mastodon.Account | Mastodon.Mention
  }
  'Tab-Shared-Attachments': { account: Mastodon.Account }
  'Tab-Shared-Hashtag': {
    hashtag: Mastodon.Tag['name']
  }
  'Tab-Shared-History': {
    id: Mastodon.Status['id']
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
export type TabSharedStackScreenProps<T extends keyof TabSharedStackParamList> =
  NativeStackScreenProps<TabSharedStackParamList, T>

export type TabLocalStackParamList = {
  'Tab-Local-Root': undefined
} & TabSharedStackParamList

export type TabPublicStackParamList = {
  'Tab-Public-Root': undefined
} & TabSharedStackParamList

export type TabNotificationsStackParamList = {
  'Tab-Notifications-Root': undefined
} & TabSharedStackParamList

export type TabMeStackParamList = {
  'Tab-Me-Root': undefined
  'Tab-Me-Bookmarks': undefined
  'Tab-Me-Conversations': undefined
  'Tab-Me-Favourites': undefined
  'Tab-Me-Lists': undefined
  'Tab-Me-Lists-List': {
    list: Mastodon.List['id']
    title: Mastodon.List['title']
  }
  'Tab-Me-Profile': undefined
  'Tab-Me-Push': undefined
  'Tab-Me-Settings': undefined
  'Tab-Me-Settings-Fontsize': undefined
  'Tab-Me-Settings-Language': undefined
  'Tab-Me-Switch': undefined
} & TabSharedStackParamList
export type TabMeStackScreenProps<T extends keyof TabMeStackParamList> =
  NativeStackScreenProps<TabMeStackParamList, T>
export type TabMeStackNavigationProp<
  RouteName extends keyof TabMeStackParamList
> = StackNavigationProp<TabMeStackParamList, RouteName>

export type TabMeProfileStackParamList = {
  'Tab-Me-Profile-Root': undefined
  'Tab-Me-Profile-Name': {
    display_name: Mastodon.Account['display_name']
  }
  'Tab-Me-Profile-Note': {
    note: Mastodon.Source['note']
  }
  'Tab-Me-Profile-Fields': {
    fields?: Mastodon.Source['fields']
  }
}
export type TabMeProfileStackScreenProps<
  T extends keyof TabMeProfileStackParamList
> = NativeStackScreenProps<TabMeProfileStackParamList, T>

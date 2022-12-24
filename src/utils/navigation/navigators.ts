import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { NavigatorScreenParams } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { StackNavigationProp } from '@react-navigation/stack'
import { ComposeState } from '@screens/Compose/utils/types'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'

export type RootStackParamList = {
  'Screen-Tabs': NavigatorScreenParams<ScreenTabsStackParamList>
  'Screen-Actions':
    | {
        type: 'notifications_filter'
      }
    | {
        type: 'alt_text'
        text: string
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
        visibility: ComposeState['visibility']
        text?: string // For contacting tooot only
      }
    | {
        type: 'share'
        text?: string
        media?: { uri: string; mime: string }[]
      }
    | undefined
  'Screen-ImagesViewer': {
    imageUrls: {
      id: Mastodon.Attachment['id']
      preview_url?: Mastodon.AttachmentImage['preview_url']
      url: Mastodon.AttachmentImage['url']
      remote_url?: Mastodon.AttachmentImage['remote_url']
      width?: number
      height?: number
    }[]
    id: Mastodon.Attachment['id']
    hideCounter?: boolean
  }
  'Screen-AccountSelection': {
    component?: () => JSX.Element | undefined
    share?: { text?: string; media?: { uri: string; mime: string }[] }
  }
}
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>

export type ScreenComposeStackParamList = {
  'Screen-Compose-Root': undefined
  'Screen-Compose-EditAttachment': { index: number }
  'Screen-Compose-DraftsList': { timestamp: number }
}
export type ScreenComposeStackScreenProps<T extends keyof ScreenComposeStackParamList> =
  NativeStackScreenProps<ScreenComposeStackParamList, T>

export type ScreenTabsStackParamList = {
  'Tab-Local': NavigatorScreenParams<TabLocalStackParamList>
  'Tab-Public': NavigatorScreenParams<TabPublicStackParamList>
  'Tab-Compose': undefined
  'Tab-Notifications': NavigatorScreenParams<TabNotificationsStackParamList>
  'Tab-Me': NavigatorScreenParams<TabMeStackParamList>
}
export type ScreenTabsScreenProps<T extends keyof ScreenTabsStackParamList> = BottomTabScreenProps<
  ScreenTabsStackParamList,
  T
>

export type TabSharedStackParamList = {
  'Tab-Shared-Account': {
    account: Partial<Mastodon.Account> & Pick<Mastodon.Account, 'id' | 'username' | 'acct'>
  }
  'Tab-Shared-Account-In-Lists': {
    account: Pick<Mastodon.Account, 'id' | 'username'>
  }
  'Tab-Shared-Attachments': { account: Mastodon.Account }
  'Tab-Shared-Hashtag': {
    hashtag: Mastodon.Tag['name']
  }
  'Tab-Shared-History': {
    id: Mastodon.Status['id']
    detectedLanguage: string
  }
  'Tab-Shared-Report': {
    account: Partial<Mastodon.Account> & Pick<Mastodon.Account, 'id' | 'acct' | 'username'>
    status?: Pick<Mastodon.Status, 'id'>
  }
  'Tab-Shared-Search': undefined
  'Tab-Shared-Toot': {
    toot: Mastodon.Status
    rootQueryKey?: QueryKeyTimeline
  }
  'Tab-Shared-Users':
    | {
        reference: 'accounts'
        account: Pick<Mastodon.Account, 'id' | 'username' | 'acct' | 'url'>
        type: 'following' | 'followers'
        count: number
      }
    | {
        reference: 'statuses'
        status: Pick<Mastodon.Status, 'id'>
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
  'Tab-Notifications-Filters': undefined
} & TabSharedStackParamList
export type TabNotificationsStackScreenProps<T extends keyof TabNotificationsStackParamList> =
  NativeStackScreenProps<TabNotificationsStackParamList, T>

export type TabMeStackParamList = {
  'Tab-Me-Root': undefined
  'Tab-Me-Bookmarks': undefined
  'Tab-Me-Conversations': undefined
  'Tab-Me-Favourites': undefined
  'Tab-Me-FollowedTags': undefined
  'Tab-Me-List': Mastodon.List
  'Tab-Me-List-Accounts': Omit<Mastodon.List, 'replies_policy'>
  'Tab-Me-List-Edit':
    | {
        type: 'add'
      }
    | {
        type: 'edit'
        payload: Mastodon.List
        key: string // To update title after successful mutation
      }
  'Tab-Me-List-List': undefined
  'Tab-Me-Profile': undefined
  'Tab-Me-Push': undefined
  'Tab-Me-Settings': undefined
  'Tab-Me-Settings-Fontsize': undefined
  'Tab-Me-Settings-Language': undefined
  'Tab-Me-Switch': undefined
} & TabSharedStackParamList
export type TabMeStackScreenProps<T extends keyof TabMeStackParamList> = NativeStackScreenProps<
  TabMeStackParamList,
  T
>
export type TabMeStackNavigationProp<RouteName extends keyof TabMeStackParamList> =
  StackNavigationProp<TabMeStackParamList, RouteName>

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
export type TabMeProfileStackScreenProps<T extends keyof TabMeProfileStackParamList> =
  NativeStackScreenProps<TabMeProfileStackParamList, T>

import client from '@api/client'
import haptics from '@components/haptics'
import { AxiosError } from 'axios'
import { uniqBy } from 'lodash'
import {
  MutationOptions,
  QueryClient,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation
} from 'react-query'
import deleteItem from './timeline/deleteItem'
import updateStatusProperty from './timeline/updateStatusProperty'

export type QueryKeyTimeline = [
  'Timeline',
  {
    page: App.Pages
    hashtag?: Mastodon.Tag['name']
    list?: Mastodon.List['id']
    toot?: Mastodon.Status['id']
    account?: Mastodon.Account['id']
  }
]

const queryFunction = ({
  queryKey,
  pageParam
}: {
  queryKey: QueryKeyTimeline
  pageParam?: { [key: string]: string }
}) => {
  const { page, account, hashtag, list, toot } = queryKey[1]
  let params: { [key: string]: string } = { ...pageParam }

  switch (page) {
    case 'Following':
      return client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: 'timelines/home',
        params
      })

    case 'Local':
      return client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: 'timelines/public',
        params: {
          ...params,
          local: 'true'
        }
      })

    case 'LocalPublic':
      return client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: 'timelines/public',
        params
      })

    case 'Notifications':
      return client<Mastodon.Notification[]>({
        method: 'get',
        instance: 'local',
        url: 'notifications',
        params
      })

    case 'Account_Default':
      if (pageParam && pageParam.hasOwnProperty('max_id')) {
        return client<Mastodon.Status[]>({
          method: 'get',
          instance: 'local',
          url: `accounts/${account}/statuses`,
          params: {
            exclude_replies: 'true',
            ...params
          }
        })
      } else {
        return client<(Mastodon.Status & { isPinned: boolean })[]>({
          method: 'get',
          instance: 'local',
          url: `accounts/${account}/statuses`,
          params: {
            pinned: 'true'
          }
        }).then(async res1 => {
          let pinned: Mastodon.Status['id'][] = []
          res1.body.forEach(status => pinned.push(status.id))
          const res2 = await client<Mastodon.Status[]>({
            method: 'get',
            instance: 'local',
            url: `accounts/${account}/statuses`,
            params: {
              exclude_replies: 'true'
            }
          })
          return {
            body: uniqBy([...res1.body, ...res2.body], 'id'),
            ...(res2.links.next && { links: { next: res2.links.next } }),
            pinned
          }
        })
      }

    case 'Account_All':
      return client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: `accounts/${account}/statuses`,
        params
      })

    case 'Account_Attachments':
      return client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: `accounts/${account}/statuses`,
        params: {
          only_media: 'true',
          ...params
        }
      })

    case 'Hashtag':
      return client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: `timelines/tag/${hashtag}`,
        params
      })

    case 'Conversations':
      return client<Mastodon.Conversation[]>({
        method: 'get',
        instance: 'local',
        url: `conversations`,
        params
      })

    case 'Bookmarks':
      return client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: `bookmarks`,
        params
      })

    case 'Favourites':
      return client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: `favourites`,
        params
      })

    case 'List':
      return client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: `timelines/list/${list}`,
        params
      })

    case 'Toot':
      return client<Mastodon.Status>({
        method: 'get',
        instance: 'local',
        url: `statuses/${toot}`
      }).then(async res1 => {
        const res2 = await client<{
          ancestors: Mastodon.Status[]
          descendants: Mastodon.Status[]
        }>({
          method: 'get',
          instance: 'local',
          url: `statuses/${toot}/context`
        })
        return {
          body: [...res2.body.ancestors, res1.body, ...res2.body.descendants]
        }
      })
    default:
      return Promise.reject()
  }
}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never
export type TimelineData = Unpromise<ReturnType<typeof queryFunction>>
const useTimelineQuery = <TData = TimelineData>({
  options,
  ...queryKeyParams
}: QueryKeyTimeline[1] & {
  options?: UseInfiniteQueryOptions<
    {
      body:
        | Mastodon.Status[]
        | Mastodon.Notification[]
        | Mastodon.Conversation[]
      links?: { prev?: string; next?: string }
      pinned?: Mastodon.Status['id'][]
    },
    AxiosError,
    TData
  >
}) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { ...queryKeyParams }]
  return useInfiniteQuery(queryKey, queryFunction, options)
}

// --- Separator ---

enum MapPropertyToUrl {
  bookmarked = 'bookmark',
  favourited = 'favourite',
  muted = 'mute',
  pinned = 'pin',
  reblogged = 'reblog'
}

export type MutationVarsTimelineUpdateStatusProperty = {
  // This is status in general, including "status" inside conversation and notification
  type: 'updateStatusProperty'
  queryKey: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
  id: Mastodon.Status['id'] | Mastodon.Poll['id']
  reblog?: boolean
  payload:
    | {
        property: 'bookmarked' | 'muted' | 'pinned'
        currentValue: boolean
        propertyCount: undefined
        countValue: undefined
      }
    | {
        property: 'favourited' | 'reblogged'
        currentValue: boolean
        propertyCount: 'favourites_count' | 'reblogs_count'
        countValue: number
      }
    | {
        property: 'poll'
        id: Mastodon.Poll['id']
        type: 'vote' | 'refresh'
        options?: boolean[]
        data?: Mastodon.Poll
      }
}

export type MutationVarsTimelineUpdateAccountProperty = {
  // This is status in general, including "status" inside conversation and notification
  type: 'updateAccountProperty'
  queryKey?: QueryKeyTimeline
  id: Mastodon.Account['id']
  payload: {
    property: 'mute' | 'block' | 'reports'
  }
}

export type MutationVarsTimelineDeleteItem = {
  // This is for deleting status and conversation
  type: 'deleteItem'
  source: 'statuses' | 'conversations'
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
  id: Mastodon.Conversation['id']
}

export type MutationVarsTimelineDomainBlock = {
  // This is for deleting status and conversation
  type: 'domainBlock'
  queryKey: QueryKeyTimeline
  domain: string
}

export type MutationVarsTimeline =
  | MutationVarsTimelineUpdateStatusProperty
  | MutationVarsTimelineUpdateAccountProperty
  | MutationVarsTimelineDeleteItem
  | MutationVarsTimelineDomainBlock

const mutationFunction = async (params: MutationVarsTimeline) => {
  switch (params.type) {
    case 'updateStatusProperty':
      switch (params.payload.property) {
        case 'poll':
          const formData = new FormData()
          params.payload.type === 'vote' &&
            params.payload.options?.forEach((option, index) => {
              if (option) {
                formData.append('choices[]', index.toString())
              }
            })

          return client<Mastodon.Poll>({
            method: params.payload.type === 'vote' ? 'post' : 'get',
            instance: 'local',
            url:
              params.payload.type === 'vote'
                ? `polls/${params.payload.id}/votes`
                : `polls/${params.payload.id}`,
            ...(params.payload.type === 'vote' && { body: formData })
          })
        default:
          return client<Mastodon.Status>({
            method: 'post',
            instance: 'local',
            url: `statuses/${params.id}/${
              params.payload.currentValue ? 'un' : ''
            }${MapPropertyToUrl[params.payload.property]}`
          })
      }
    case 'updateAccountProperty':
      switch (params.payload.property) {
        case 'block':
        case 'mute':
          return client<Mastodon.Account>({
            method: 'post',
            instance: 'local',
            url: `accounts/${params.id}/${params.payload.property}`
          })
        case 'reports':
          return client<Mastodon.Account>({
            method: 'post',
            instance: 'local',
            url: `reports`,
            params: {
              account_id: params.id
            }
          })
      }
    case 'deleteItem':
      return client<Mastodon.Conversation>({
        method: 'delete',
        instance: 'local',
        url: `${params.source}/${params.id}`
      })
    case 'domainBlock':
      return client<any>({
        method: 'post',
        instance: 'local',
        url: `domain_blocks`,
        params: {
          domain: params.domain
        }
      })
  }
}

type MutationOptionsTimeline = MutationOptions<
  { body: Mastodon.Conversation | Mastodon.Notification | Mastodon.Status },
  AxiosError,
  MutationVarsTimeline
>

const useTimelineMutation = ({
  queryClient,
  onError,
  onMutate,
  onSettled,
  onSuccess
}: {
  queryClient: QueryClient
  onError?: MutationOptionsTimeline['onError']
  onMutate?: boolean
  onSettled?: MutationOptionsTimeline['onSettled']
  onSuccess?: MutationOptionsTimeline['onSuccess']
}) => {
  return useMutation<
    { body: Mastodon.Conversation | Mastodon.Notification | Mastodon.Status },
    AxiosError,
    MutationVarsTimeline
  >(mutationFunction, {
    onError,
    onSettled,
    onSuccess,
    ...(onMutate && {
      onMutate: params => {
        queryClient.cancelQueries(params.queryKey)
        let oldData
        params.queryKey && (oldData = queryClient.getQueryData(params.queryKey))

        haptics('Success')
        switch (params.type) {
          case 'updateStatusProperty':
            updateStatusProperty({ queryClient, ...params })
            break
          case 'deleteItem':
            deleteItem({ queryClient, ...params })
            break
        }
        return oldData
      }
    })
  })
}

export { useTimelineQuery, useTimelineMutation }

import apiInstance, { InstanceResponse } from '@api/instance'
import haptics from '@components/haptics'
import queryClient from '@helpers/queryClient'
import { store } from '@root/store'
import {
  checkInstanceFeature,
  getInstanceNotificationsFilter
} from '@utils/slices/instancesSlice'
import { AxiosError } from 'axios'
import { uniqBy } from 'lodash'
import {
  MutationOptions,
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation
} from 'react-query'
import deleteItem from './timeline/deleteItem'
import editItem from './timeline/editItem'
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

const queryFunction = async ({
  queryKey,
  pageParam
}: QueryFunctionContext<QueryKeyTimeline>) => {
  const { page, account, hashtag, list, toot } = queryKey[1]
  let params: { [key: string]: string } = { ...pageParam }

  switch (page) {
    case 'Following':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: 'timelines/home',
        params
      })

    case 'Local':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: 'timelines/public',
        params: {
          ...params,
          local: 'true'
        }
      })

    case 'LocalPublic':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: 'timelines/public',
        params
      })

    case 'Notifications':
      const rootStore = store.getState()
      const notificationsFilter = getInstanceNotificationsFilter(rootStore)
      const usePositiveFilter = checkInstanceFeature(
        'notification_types_positive_filter'
      )(rootStore)
      return apiInstance<Mastodon.Notification[]>({
        method: 'get',
        url: 'notifications',
        params: {
          ...params,
          ...(notificationsFilter &&
            (usePositiveFilter
              ? {
                  types: Object.keys(notificationsFilter)
                    // @ts-ignore
                    .filter(filter => notificationsFilter[filter] === true)
                }
              : {
                  exclude_types: Object.keys(notificationsFilter)
                    // @ts-ignore
                    .filter(filter => notificationsFilter[filter] === false)
                }))
        }
      })

    case 'Account_Default':
      if (pageParam && pageParam.hasOwnProperty('max_id')) {
        return apiInstance<Mastodon.Status[]>({
          method: 'get',
          url: `accounts/${account}/statuses`,
          params: {
            exclude_replies: 'true',
            ...params
          }
        })
      } else {
        const res1 = await apiInstance<
          (Mastodon.Status & { _pinned: boolean })[]
        >({
          method: 'get',
          url: `accounts/${account}/statuses`,
          params: {
            pinned: 'true'
          }
        })
        res1.body = res1.body.map(status => {
          status._pinned = true
          return status
        })
        const res2 = await apiInstance<Mastodon.Status[]>({
          method: 'get',
          url: `accounts/${account}/statuses`,
          params: {
            exclude_replies: 'true'
          }
        })
        return {
          body: uniqBy([...res1.body, ...res2.body], 'id'),
          ...(res2.links.next && { links: { next: res2.links.next } })
        }
      }

    case 'Account_All':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: `accounts/${account}/statuses`,
        params
      })

    case 'Account_Attachments':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: `accounts/${account}/statuses`,
        params: {
          only_media: 'true',
          ...params
        }
      })

    case 'Hashtag':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: `timelines/tag/${hashtag}`,
        params
      })

    case 'Conversations':
      return apiInstance<Mastodon.Conversation[]>({
        method: 'get',
        url: `conversations`,
        params
      })

    case 'Bookmarks':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: `bookmarks`,
        params
      })

    case 'Favourites':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: `favourites`,
        params
      })

    case 'List':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: `timelines/list/${list}`,
        params
      })

    case 'Toot':
      const res1_1 = await apiInstance<Mastodon.Status>({
        method: 'get',
        url: `statuses/${toot}`
      })
      const res2_1 = await apiInstance<{
        ancestors: Mastodon.Status[]
        descendants: Mastodon.Status[]
      }>({
        method: 'get',
        url: `statuses/${toot}/context`
      })
      return {
        body: [
          ...res2_1.body.ancestors,
          res1_1.body,
          ...res2_1.body.descendants
        ]
      }
    default:
      return Promise.reject()
  }
}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never
export type TimelineData = Unpromise<ReturnType<typeof queryFunction>>
const useTimelineQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyTimeline[1] & {
  options?: UseInfiniteQueryOptions<
    InstanceResponse<Mastodon.Status[]>,
    AxiosError
  >
}) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { ...queryKeyParams }]
  return useInfiniteQuery(queryKey, queryFunction, {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    ...options
  })
}

const prefetchTimelineQuery = async ({
  ids,
  queryKey
}: {
  ids: Mastodon.Status['id'][]
  queryKey: QueryKeyTimeline
}): Promise<Mastodon.Status['id'] | undefined> => {
  let page: string = ''
  let local: boolean = false
  switch (queryKey[1].page) {
    case 'Following':
      page = 'home'
      break
    case 'Local':
      page = 'public'
      local = true
      break
    case 'LocalPublic':
      page = 'public'
      break
  }

  for (const id of ids) {
    const statuses = await apiInstance<Mastodon.Status[]>({
      method: 'get',
      url: `timelines/${page}`,
      params: {
        min_id: id,
        limit: 1,
        ...(local && { local: 'true' })
      }
    })
    if (statuses.body.length) {
      await queryClient.prefetchInfiniteQuery(queryKey, props =>
        queryFunction({
          ...props,
          queryKey,
          pageParam: {
            max_id: statuses.body[0].id
          }
        })
      )
      return id
    }
  }
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

export type MutationVarsTimelineEditItem = {
  // This is for editing status
  type: 'editItem'
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
  status: Mastodon.Status
}

export type MutationVarsTimelineDeleteItem = {
  // This is for deleting status and conversation
  type: 'deleteItem'
  source: 'statuses' | 'conversations'
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
  id: Mastodon.Status['id']
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
  | MutationVarsTimelineEditItem
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

          return apiInstance<Mastodon.Poll>({
            method: params.payload.type === 'vote' ? 'post' : 'get',
            url:
              params.payload.type === 'vote'
                ? `polls/${params.payload.id}/votes`
                : `polls/${params.payload.id}`,
            ...(params.payload.type === 'vote' && { body: formData })
          })
        default:
          return apiInstance<Mastodon.Status>({
            method: 'post',
            url: `statuses/${params.id}/${
              params.payload.currentValue ? 'un' : ''
            }${MapPropertyToUrl[params.payload.property]}`
          })
      }
    case 'updateAccountProperty':
      switch (params.payload.property) {
        case 'block':
        case 'mute':
          return apiInstance<Mastodon.Account>({
            method: 'post',
            url: `accounts/${params.id}/${params.payload.property}`
          })
        case 'reports':
          return apiInstance<Mastodon.Account>({
            method: 'post',
            url: `reports`,
            params: {
              account_id: params.id
            }
          })
      }
    case 'editItem':
      return { body: params.status }
    case 'deleteItem':
      return apiInstance<Mastodon.Conversation>({
        method: 'delete',
        url: `${params.source}/${params.id}`
      })
    case 'domainBlock':
      return apiInstance<any>({
        method: 'post',
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
  onError,
  onMutate,
  onSettled,
  onSuccess
}: {
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
        const oldData =
          params.queryKey && queryClient.getQueryData(params.queryKey)

        haptics('Light')
        switch (params.type) {
          case 'updateStatusProperty':
            updateStatusProperty(params)
            break
          case 'editItem':
            editItem(params)
            break
          case 'deleteItem':
            deleteItem(params)
            break
        }
        return oldData
      }
    })
  })
}

export { prefetchTimelineQuery, useTimelineQuery, useTimelineMutation }

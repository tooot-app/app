import client from '@api/client'
import { AxiosError } from 'axios'
import { uniqBy } from 'lodash'
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query'

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
}: {
  queryKey: QueryKeyTimeline
  pageParam?: { direction: 'prev' | 'next'; id: Mastodon.Status['id'] }
}) => {
  const { page, account, hashtag, list, toot } = queryKey[1]
  let res
  let params: { [key: string]: string } = {}

  if (pageParam) {
    switch (pageParam.direction) {
      case 'prev':
        if (page === 'Bookmarks' || page === 'Favourites') {
          params.max_id = pageParam.id
        } else {
          params.min_id = pageParam.id
        }
        break
      case 'next':
        if (page === 'Bookmarks' || page === 'Favourites') {
          params.min_id = pageParam.id
        } else {
          params.max_id = pageParam.id
        }
        break
    }
  }

  switch (page) {
    case 'Following':
      res = await client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: 'timelines/home',
        params
      })
      return Promise.resolve({
        toots: res,
        pointer: undefined,
        pinnedLength: undefined
      })

    case 'Local':
      params.local = 'true'
      res = await client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: 'timelines/public',
        params
      })
      return Promise.resolve({
        toots: res,
        pointer: undefined,
        pinnedLength: undefined
      })

    case 'LocalPublic':
      res = await client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: 'timelines/public',
        params
      })
      return Promise.resolve({
        toots: res,
        pointer: undefined,
        pinnedLength: undefined
      })

    case 'RemotePublic':
      res = await client<Mastodon.Status[]>({
        method: 'get',
        instance: 'remote',
        url: 'timelines/public',
        params
      })
      return Promise.resolve({
        toots: res,
        pointer: undefined,
        pinnedLength: undefined
      })

    case 'Notifications':
      res = await client<Mastodon.Notification[]>({
        method: 'get',
        instance: 'local',
        url: 'notifications',
        params
      })
      return Promise.resolve({
        toots: res,
        pointer: undefined,
        pinnedLength: undefined
      })

    case 'Account_Default':
      if (pageParam && pageParam.direction === 'next') {
        res = await client<Mastodon.Status[]>({
          method: 'get',
          instance: 'local',
          url: `accounts/${account}/statuses`,
          params: {
            exclude_replies: 'true',
            ...params
          }
        })
        return Promise.resolve({
          toots: res,
          pointer: undefined,
          pinnedLength: undefined
        })
      } else {
        res = await client<Mastodon.Status[]>({
          method: 'get',
          instance: 'local',
          url: `accounts/${account}/statuses`,
          params: {
            pinned: 'true'
          }
        })
        const pinnedLength = res.length
        let toots = res
        res = await client<Mastodon.Status[]>({
          method: 'get',
          instance: 'local',
          url: `accounts/${account}/statuses`,
          params: {
            exclude_replies: 'true'
          }
        })
        toots = uniqBy([...toots, ...res], 'id')
        return Promise.resolve({
          toots: toots,
          pointer: undefined,
          pinnedLength
        })
      }

    case 'Account_All':
      res = await client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: `accounts/${account}/statuses`,
        params
      })
      return Promise.resolve({
        toots: res,
        pointer: undefined,
        pinnedLength: undefined
      })

    case 'Account_Media':
      res = await client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: `accounts/${account}/statuses`,
        params: {
          only_media: 'true',
          ...params
        }
      })
      return Promise.resolve({
        toots: res,
        pointer: undefined,
        pinnedLength: undefined
      })

    case 'Hashtag':
      res = await client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: `timelines/tag/${hashtag}`,
        params
      })
      return Promise.resolve({
        toots: res,
        pointer: undefined,
        pinnedLength: undefined
      })

    case 'Conversations':
      res = await client<Mastodon.Conversation[]>({
        method: 'get',
        instance: 'local',
        url: `conversations`,
        params
      })
      if (pageParam) {
        // Bug in pull to refresh in conversations
        res = res.filter(b => b.id !== pageParam.id)
      }
      return Promise.resolve({
        toots: res,
        pointer: undefined,
        pinnedLength: undefined
      })

    case 'Bookmarks':
      res = await client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: `bookmarks`,
        params
      })
      return Promise.resolve({
        toots: res,
        pointer: undefined,
        pinnedLength: undefined
      })

    case 'Favourites':
      res = await client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: `favourites`,
        params
      })
      return Promise.resolve({
        toots: res,
        pointer: undefined,
        pinnedLength: undefined
      })

    case 'List':
      res = await client<Mastodon.Status[]>({
        method: 'get',
        instance: 'local',
        url: `timelines/list/${list}`,
        params
      })
      return Promise.resolve({
        toots: res,
        pointer: undefined,
        pinnedLength: undefined
      })

    case 'Toot':
      res = await client<Mastodon.Status>({
        method: 'get',
        instance: 'local',
        url: `statuses/${toot}`
      })
      const theToot = res
      res = await client<{
        ancestors: Mastodon.Status[]
        descendants: Mastodon.Status[]
      }>({
        method: 'get',
        instance: 'local',
        url: `statuses/${toot}/context`
      })
      return Promise.resolve({
        toots: [...res.ancestors, theToot, ...res.descendants],
        pointer: res.ancestors.length,
        pinnedLength: undefined
      })
    default:
      return Promise.reject()
  }
}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never
const hookTimeline = <TData = Unpromise<ReturnType<typeof queryFunction>>>({
  options,
  ...queryKeyParams
}: QueryKeyTimeline[1] & {
  options?: UseInfiniteQueryOptions<any, AxiosError, TData>
}) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { ...queryKeyParams }]
  return useInfiniteQuery(queryKey, queryFunction, options)
}

export default hookTimeline

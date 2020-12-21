import { uniqBy } from 'lodash'

import client from '@api/client'

export const timelineFetch = async ({
  queryKey,
  pageParam
}: {
  queryKey: QueryKey.Timeline
  pageParam?: { direction: 'prev' | 'next'; id: Mastodon.Status['id'] }
}): Promise<{
  toots: Mastodon.Status[]
  pointer?: number
  pinnedLength?: number
}> => {
  const [page, { account, hashtag, list, toot }] = queryKey
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
      res = await client({
        method: 'get',
        instance: 'local',
        url: 'timelines/home',
        params
      })
      return Promise.resolve({ toots: res.body })

    case 'Local':
      params.local = 'true'
      res = await client({
        method: 'get',
        instance: 'local',
        url: 'timelines/public',
        params
      })
      return Promise.resolve({ toots: res.body })

    case 'LocalPublic':
      res = await client({
        method: 'get',
        instance: 'local',
        url: 'timelines/public',
        params
      })
      return Promise.resolve({ toots: res.body })

    case 'RemotePublic':
      res = await client({
        method: 'get',
        instance: 'remote',
        url: 'timelines/public',
        params
      })
      return Promise.resolve({ toots: res.body })

    case 'Notifications':
      res = await client({
        method: 'get',
        instance: 'local',
        url: 'notifications',
        params
      })
      return Promise.resolve({ toots: res.body })

    case 'Account_Default':
      if (pageParam && pageParam.direction === 'next') {
        res = await client({
          method: 'get',
          instance: 'local',
          url: `accounts/${account}/statuses`,
          params: {
            exclude_replies: 'true',
            ...params
          }
        })
        return Promise.resolve({ toots: res.body })
      } else {
        res = await client({
          method: 'get',
          instance: 'local',
          url: `accounts/${account}/statuses`,
          params: {
            pinned: 'true'
          }
        })
        const pinnedLength = res.body.length
        let toots: Mastodon.Status[] = res.body
        res = await client({
          method: 'get',
          instance: 'local',
          url: `accounts/${account}/statuses`,
          params: {
            exclude_replies: 'true'
          }
        })
        toots = uniqBy([...toots, ...res.body], 'id')
        return Promise.resolve({ toots: toots, pinnedLength })
      }
      break

    case 'Account_All':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `accounts/${account}/statuses`,
        params
      })
      return Promise.resolve({ toots: res.body })

    case 'Account_Media':
      console.log(account)
      res = await client({
        method: 'get',
        instance: 'local',
        url: `accounts/${account}/statuses`,
        params: {
          only_media: 'true',
          ...params
        }
      })
      return Promise.resolve({ toots: res.body })

    case 'Hashtag':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `timelines/tag/${hashtag}`,
        params
      })
      return Promise.resolve({ toots: res.body })

    case 'Conversations':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `conversations`,
        params
      })
      if (pageParam) {
        // Bug in pull to refresh in conversations
        res.body = res.body.filter(
          (b: Mastodon.Conversation) => b.id !== pageParam.id
        )
      }
      return Promise.resolve({ toots: res.body })

    case 'Bookmarks':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `bookmarks`,
        params
      })
      return Promise.resolve({ toots: res.body })

    case 'Favourites':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `favourites`,
        params
      })
      return Promise.resolve({ toots: res.body })

    case 'List':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `timelines/list/${list}`,
        params
      })
      return Promise.resolve({ toots: res.body })

    case 'Toot':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `statuses/${toot!.id}/context`
      })
      return Promise.resolve({
        toots: [...res.body.ancestors, toot, ...res.body.descendants],
        pointer: res.body.ancestors.length
      })
    default:
      return Promise.reject()
  }
}

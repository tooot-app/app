import { uniqBy } from 'lodash'

import client from '@api/client'

export const timelineFetch = async (
  key: string,
  {
    page,
    params = {},
    account,
    hashtag,
    list,
    toot
  }: {
    page: App.Pages
    params?: {
      [key: string]: string | number | boolean
    }
    hashtag?: Mastodon.Tag['name']
    list?: Mastodon.List['id']
    toot?: Mastodon.Status
    account?: Mastodon.Account['id']
  },
  pagination: {
    direction: 'prev' | 'next'
    id: string
  }
): Promise<{
  toots: Mastodon.Status[]
  pointer?: number
  pinnedLength?: number
}> => {
  let res

  if (pagination && pagination.id) {
    switch (pagination.direction) {
      case 'prev':
        params.min_id = pagination.id
        break
      case 'next':
        params.max_id = pagination.id
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
      if (pagination && pagination.id) {
        if (pagination.direction === 'prev') {
          res = await client({
            method: 'get',
            instance: 'local',
            url: `accounts/${account}/statuses`,
            params: {
              pinned: 'true',
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
              exclude_replies: 'true',
              ...params
            }
          })
          return Promise.resolve({ toots: res.body })
        }
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
      res = await client({
        method: 'get',
        instance: 'local',
        url: `accounts/${account}/statuses`,
        params: {
          only_media: 'true'
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
      if (pagination) {
        // Bug in pull to refresh in conversations
        res.body = res.body.filter(
          (b: Mastodon.Conversation) => b.id !== pagination.id
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
  }
}

import { uniqBy } from 'lodash'

import client from 'src/api/client'

export const timelineFetch = async (
  key: string,
  {
    page,
    query = {},
    account,
    hashtag,
    list,
    toot
  }: {
    page: string
    query?: {
      [key: string]: string | number | boolean
    }
    account?: string
    hashtag?: string
    list?: string
    toot?: string
  },
  pagination: {
    direction: 'prev' | 'next'
    id: string
  }
) => {
  let res

  if (pagination && pagination.id) {
    switch (pagination.direction) {
      case 'prev':
        query.min_id = pagination.id
        break
      case 'next':
        query.max_id = pagination.id
        break
    }
  }

  switch (page) {
    case 'Following':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: 'timelines/home',
        query
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Local':
      query.local = 'true'
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: 'timelines/public',
        query
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'LocalPublic':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: 'timelines/public',
        query
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'RemotePublic':
      res = await client({
        method: 'get',
        instance: 'remote',
        endpoint: 'timelines/public',
        query
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Notifications':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: 'notifications',
        query
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Account_Default':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: `accounts/${account}/statuses`,
        query: {
          pinned: 'true'
        }
      })
      let toots: Mastodon.Status[] = res.body
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: `accounts/${account}/statuses`,
        query: {
          exclude_replies: 'true'
        }
      })
      toots = uniqBy([...toots, ...res.body], 'id')
      return Promise.resolve({ toots: toots, pointer: null })

    case 'Account_All':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: `accounts/${account}/statuses`,
        query
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Account_Media':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: `accounts/${account}/statuses`,
        query: {
          only_media: 'true'
        }
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Hashtag':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: `timelines/tag/${hashtag}`,
        query
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Conversations':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: `conversations`,
        query
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Bookmarks':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: `bookmarks`,
        query
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Favourites':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: `favourites`,
        query
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'List':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: `timelines/list/${list}`,
        query
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Toot':
      const current = await client({
        method: 'get',
        instance: 'local',
        endpoint: `statuses/${toot}`
      })
      const context = await client({
        method: 'get',
        instance: 'local',
        endpoint: `statuses/${toot}/context`
      })
      return Promise.resolve({
        toots: [
          ...context.body.ancestors,
          current.body,
          ...context.body.descendants
        ],
        pointer: context.body.ancestors.length
      })

    default:
      console.error('Page is not provided')
  }
}

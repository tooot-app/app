import { uniqBy } from 'lodash'

import client from 'src/api/client'

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
    page: string
    params?: {
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
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Local':
      params.local = 'true'
      res = await client({
        method: 'get',
        instance: 'local',
        url: 'timelines/public',
        params
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'LocalPublic':
      res = await client({
        method: 'get',
        instance: 'local',
        url: 'timelines/public',
        params
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'RemotePublic':
      res = await client({
        method: 'get',
        instance: 'remote',
        url: 'timelines/public',
        params
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Notifications':
      res = await client({
        method: 'get',
        instance: 'local',
        url: 'notifications',
        params
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Account_Default':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `accounts/${account}/statuses`,
        params: {
          pinned: 'true'
        }
      })
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
      return Promise.resolve({ toots: toots, pointer: null })

    case 'Account_All':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `accounts/${account}/statuses`,
        params
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Account_Media':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `accounts/${account}/statuses`,
        params: {
          only_media: 'true'
        }
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Hashtag':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `timelines/tag/${hashtag}`,
        params
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Conversations':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `conversations`,
        params
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Bookmarks':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `bookmarks`,
        params
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Favourites':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `favourites`,
        params
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'List':
      res = await client({
        method: 'get',
        instance: 'local',
        url: `timelines/list/${list}`,
        params
      })
      return Promise.resolve({ toots: res.body, pointer: null })

    case 'Toot':
      const current = await client({
        method: 'get',
        instance: 'local',
        url: `statuses/${toot}`
      })
      const context = await client({
        method: 'get',
        instance: 'local',
        url: `statuses/${toot}/context`
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

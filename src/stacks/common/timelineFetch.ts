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
      return Promise.resolve({ toots: res.body })

    case 'Local':
      query.local = 'true'
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: 'timelines/public',
        query
      })
      return Promise.resolve({ toots: res.body })

    case 'LocalPublic':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: 'timelines/public',
        query
      })
      return Promise.resolve({ toots: res.body })

    case 'RemotePublic':
      res = await client({
        method: 'get',
        instance: 'remote',
        endpoint: 'timelines/public',
        query
      })
      return Promise.resolve({ toots: res.body })

    case 'Notifications':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: 'notifications',
        query
      })
      return Promise.resolve({ toots: res.body })

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
      return Promise.resolve({ toots: toots })

    case 'Account_All':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: `accounts/${account}/statuses`,
        query
      })
      return Promise.resolve({ toots: res.body })

    case 'Account_Media':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: `accounts/${account}/statuses`,
        query: {
          only_media: 'true'
        }
      })
      return Promise.resolve({ toots: res.body })

    case 'Hashtag':
      res = await client({
        method: 'get',
        instance: 'local',
        endpoint: `timelines/tag/${hashtag}`,
        query
      })
      return Promise.resolve({ toots: res.body })

    // case 'List':
    //   res = await client({
    //     method: 'get',
    //     instance: 'local',
    //     endpoint: `timelines/list/${list}`,
    //     query
    //   })
    //   return {
    //     toots: res.body
    //   }

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
      console.error('First time fetching timeline error')
  }
}

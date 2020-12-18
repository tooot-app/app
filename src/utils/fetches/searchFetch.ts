import client from '@api/client'

export const searchFetch = async ({
  queryKey
}: {
  queryKey: QueryKey.Search
}): Promise<
  | Mastodon.Account[]
  | Mastodon.Tag[]
  | Mastodon.Status[]
  | {
      accounts: Mastodon.Account[]
      hashtags: Mastodon.Tag[]
      statuses: Mastodon.Status[]
    }
> => {
  const [_, { type, term, limit = 20 }] = queryKey
  const res = await client({
    version: 'v2',
    method: 'get',
    instance: 'local',
    url: 'search',
    params: { ...(type && { type }), q: term, limit }
  })
  if (type) {
    return Promise.resolve(res.body[type])
  } else {
    return Promise.resolve(res.body)
  }
}

import client from '@api/client'

export const accountFetch = async ({
  queryKey
}: {
  queryKey: QueryKey.Account
}): Promise<Mastodon.Account> => {
  const [_, { id }] = queryKey

  const res = await client({
    method: 'get',
    instance: 'local',
    url: `accounts/${id}`
  })
  return Promise.resolve(res.body)
}

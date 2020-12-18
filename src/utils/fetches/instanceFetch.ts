import client from '@api/client'

export const instanceFetch = async ({
  queryKey
}: {
  queryKey: QueryKey.Instance
}): Promise<Mastodon.Instance> => {
  const [_, { instanceDomain }] = queryKey

  const res = await client({
    method: 'get',
    instance: 'remote',
    instanceDomain,
    url: `instance`
  })
  return Promise.resolve(res.body)
}

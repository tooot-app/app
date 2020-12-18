import client from '@api/client'

export const relationshipFetch = async ({
  queryKey
}: {
  queryKey: QueryKey.Relationship
}): Promise<Mastodon.Relationship> => {
  const [_, { id }] = queryKey

  const res = await client({
    method: 'get',
    instance: 'local',
    url: `accounts/relationships`,
    params: {
      'id[]': id
    }
  })
  return Promise.resolve(res.body[0])
}

import client from '@api/client'

export const relationshipFetch = async (
  key: string,
  { id }: { id: string }
): Promise<Mastodon.Relationship> => {
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

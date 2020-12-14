import client from '@api/client'

export const accountFetch = async (
  key: string,
  { id }: { id: string }
): Promise<Mastodon.Account> => {
  const res = await client({
    method: 'get',
    instance: 'local',
    url: `accounts/${id}`
  })
  return Promise.resolve(res.body)
}

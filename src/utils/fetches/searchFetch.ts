import client from 'src/api/client'

export const searchFetch = async (
  {} = {},
  {
    type,
    term,
    limit = 20
  }: {
    type: 'accounts' | 'hashtags' | 'statuses'
    term: string
    limit?: number
  }
) => {
  const res = await client({
    version: 'v2',
    method: 'get',
    instance: 'local',
    url: 'search',
    params: { type, q: term, limit }
  })
  return Promise.resolve(res.body)
}

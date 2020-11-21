import client from 'src/api/client'

export const accountFetch = async (key: string, { id }: { id: string }) => {
  const res = await client({
    method: 'get',
    instance: 'local',
    endpoint: `accounts/${id}`
  })
  return Promise.resolve(res.body)
}

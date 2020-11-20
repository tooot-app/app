import client from 'src/api/client'

export const instanceFetch = async (
  key: string,
  { instance }: { instance: string }
) => {
  const res = await client({
    method: 'get',
    instance: 'remote',
    instanceUrl: instance,
    endpoint: `instance`
  })
  return Promise.resolve(res.body)
}

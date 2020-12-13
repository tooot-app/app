import client from '@api/client'

export const instanceFetch = async (
  key: string,
  { instance }: { instance: string }
) => {
  const res = await client({
    method: 'get',
    instance: 'remote',
    instanceDomain: instance,
    url: `instance`
  })
  return Promise.resolve(res.body)
}

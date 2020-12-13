import client from '@api/client'

export const listsFetch = async () => {
  const res = await client({
    method: 'get',
    instance: 'local',
    url: 'lists'
  })
  return Promise.resolve(res.body)
}

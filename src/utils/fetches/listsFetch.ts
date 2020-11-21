import client from 'src/api/client'

export const listsFetch = async () => {
  const res = await client({
    method: 'get',
    instance: 'local',
    endpoint: 'lists'
  })
  return Promise.resolve(res.body)
}

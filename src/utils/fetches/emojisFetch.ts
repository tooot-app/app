import client from 'src/api/client'

export const emojisFetch = async () => {
  const res = await client({
    method: 'get',
    instance: 'local',
    endpoint: 'custom_emojis'
  })
  return Promise.resolve(res.body)
}

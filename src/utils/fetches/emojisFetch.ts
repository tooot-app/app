import client from 'src/api/client'

export const emojisFetch = async () => {
  const res = await client({
    method: 'get',
    instance: 'local',
    url: 'custom_emojis'
  })
  return Promise.resolve(res.body)
}

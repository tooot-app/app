import client from '@api/client'

export const emojisFetch = async (): Promise<Mastodon.Emoji[]> => {
  const res = await client({
    method: 'get',
    instance: 'local',
    url: 'custom_emojis'
  })
  return Promise.resolve(res.body)
}

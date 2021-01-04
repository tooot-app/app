import client from '@api/client'

export const relationshipsFetch = async ({
  queryKey,
  pageParam
}: {
  queryKey: QueryKey.Relationships
  pageParam?: { direction: 'next'; id: Mastodon.Status['id'] }
}): Promise<Mastodon.Account[]> => {
  const [_, type, { id }] = queryKey
  let params: { [key: string]: string } = {}

  if (pageParam) {
    switch (pageParam.direction) {
      case 'next':
        params.max_id = pageParam.id
        break
    }
  }

  const res = await client({
    method: 'get',
    instance: 'local',
    url: `accounts/${id}/${type}`,
    params
  })
  return Promise.resolve(res.body)
}

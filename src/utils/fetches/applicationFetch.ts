import client from '@api/client'

export const applicationFetch = async ({
  queryKey
}: {
  queryKey: QueryKey.Application
}): Promise<Mastodon.AppOauth> => {
  const [_, { instanceDomain }] = queryKey

  const formData = new FormData()
  formData.append('client_name', 'test_dudu')
  formData.append('redirect_uris', 'exp://127.0.0.1:19000')
  formData.append('scopes', 'read write follow push')

  const res = await client({
    method: 'post',
    instance: 'remote',
    instanceDomain,
    url: `apps`,
    body: formData
  })
  return Promise.resolve(res.body)
}

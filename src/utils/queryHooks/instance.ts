import client from '@api/client'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = [
  'Instance',
  { instanceDomain?: string; checkPublic: boolean }
]

const queryFunction = async ({ queryKey }: { queryKey: QueryKey }) => {
  const { instanceDomain, checkPublic } = queryKey[1]

  let res: Mastodon.Instance & { publicAllow?: boolean } = await client<
    Mastodon.Instance
  >({
    method: 'get',
    instance: 'remote',
    instanceDomain,
    url: `instance`
  })

  if (checkPublic) {
    let check
    try {
      check = await client<Mastodon.Status[]>({
        method: 'get',
        instance: 'remote',
        instanceDomain,
        url: `timelines/public`
      })
    } catch {}

    if (check) {
      res.publicAllow = true
      return res
    } else {
      res.publicAllow = false
      return res
    }
  }
  return res
}

const useInstanceQuery = <
  TData = Mastodon.Instance & { publicAllow?: boolean }
>({
  options,
  ...queryKeyParams
}: QueryKey[1] & {
  options?: UseQueryOptions<
    Mastodon.Instance & { publicAllow?: boolean },
    AxiosError,
    TData
  >
}) => {
  const queryKey: QueryKey = ['Instance', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export { useInstanceQuery }

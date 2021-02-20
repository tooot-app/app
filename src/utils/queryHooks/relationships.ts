import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query'

export type QueryKey = [
  'Relationships',
  { type: 'following' | 'followers'; id: Mastodon.Account['id'] }
]

const queryFunction = ({
  queryKey,
  pageParam
}: {
  queryKey: QueryKey
  pageParam?: { [key: string]: string }
}) => {
  const { type, id } = queryKey[1]
  let params: { [key: string]: string } = { ...pageParam }

  return apiInstance<Mastodon.Account[]>({
    method: 'get',
    url: `accounts/${id}/${type}`,
    params
  })
}

const useRelationshipsQuery = <TData = Mastodon.Account[]>({
  options,
  ...queryKeyParams
}: QueryKey[1] & {
  options?: UseInfiniteQueryOptions<
    {
      body: Mastodon.Account[]
      links?: { prev?: string; next?: string }
    },
    AxiosError,
    TData
  >
}) => {
  const queryKey: QueryKey = ['Relationships', { ...queryKeyParams }]
  return useInfiniteQuery(queryKey, queryFunction, options)
}

export { useRelationshipsQuery }

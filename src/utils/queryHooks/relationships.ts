import client from '@api/client'
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
  pageParam?: { direction: 'next'; id: Mastodon.Status['id'] }
}) => {
  const { type, id } = queryKey[1]
  let params: { [key: string]: string } = {}

  if (pageParam) {
    switch (pageParam.direction) {
      case 'next':
        params.max_id = pageParam.id
        break
    }
  }

  return client<Mastodon.Account[]>({
    method: 'get',
    instance: 'local',
    url: `accounts/${id}/${type}`,
    params
  })
}

const useRelationshipsQuery = <TData = Mastodon.Account[]>({
  options,
  ...queryKeyParams
}: QueryKey[1] & {
  options?: UseInfiniteQueryOptions<Mastodon.Account[], AxiosError, TData>
}) => {
  const queryKey: QueryKey = ['Relationships', { ...queryKeyParams }]
  return useInfiniteQuery(queryKey, queryFunction, options)
}

export { useRelationshipsQuery }

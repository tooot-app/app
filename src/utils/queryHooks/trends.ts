import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'
import { featureCheck } from '@helpers/featureCheck'

export type QueryKeyTrends = ['Trends', { type: 'tags' | 'statuses' | 'links' }]

const queryFunction = ({ queryKey }: QueryFunctionContext<QueryKeyTrends>) => {
  const trendsNewPath = featureCheck('trends_new_path')

  if (!trendsNewPath && queryKey[1].type !== 'tags') {
    return []
  }

  const { type } = queryKey[1]

  switch (type) {
    case 'tags':
      return apiInstance<Mastodon.Tag[]>({
        method: 'get',
        url: trendsNewPath ? 'trends/tags' : 'trends'
      }).then(res => res.body)
    case 'statuses':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: 'trends/tags'
      }).then(res => res.body)
  }
}

const useTrendsQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyTrends[1] & {
  options?: UseQueryOptions<Mastodon.Tag[] | Mastodon.Status[], AxiosError>
}) => {
  const queryKey: QueryKeyTrends = ['Trends', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export { useTrendsQuery }

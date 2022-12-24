import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

export type QueryKeyRules = ['Rules']

const queryFunction = () =>
  apiInstance<Mastodon.Rule[]>({
    method: 'get',
    url: 'instance/rules'
  }).then(res => res.body)

const useRulesQuery = (params?: { options?: UseQueryOptions<Mastodon.Rule[], AxiosError> }) => {
  const queryKey: QueryKeyRules = ['Rules']
  return useQuery(queryKey, queryFunction, params?.options)
}

export { useRulesQuery }

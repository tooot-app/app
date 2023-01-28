import {
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions
} from '@tanstack/react-query'
import { PagedResponse } from '@utils/api/helpers'
import apiInstance from '@utils/api/instance'
import { AxiosError } from 'axios'
import { infinitePageParams } from './utils'

export type QueryKeyLists = ['Lists']

const queryFunction = async () => {
  const res = await apiInstance<Mastodon.List[]>({
    method: 'get',
    url: 'lists'
  })
  return res.body
}

const useListsQuery = (
  params: { options?: UseQueryOptions<Mastodon.List[], AxiosError> } | void
) => {
  const queryKey: QueryKeyLists = ['Lists']
  return useQuery(queryKey, queryFunction, params?.options)
}

type MutationVarsLists =
  | {
      type: 'add'
      payload: Omit<Mastodon.List, 'id'>
    }
  | {
      type: 'edit'
      payload: Mastodon.List
    }
  | {
      type: 'delete'
      payload: Pick<Mastodon.List, 'id'>
    }

const mutationFunction = async (params: MutationVarsLists) => {
  const body: { title?: string; replies_policy?: string } = {}
  switch (params.type) {
    case 'add':
      body.title = params.payload.title
      body.replies_policy = params.payload.replies_policy

      return apiInstance<Mastodon.List>({
        method: 'post',
        url: 'lists',
        body
      }).then(res => res.body)
    case 'edit':
      body.title = params.payload.title
      body.replies_policy = params.payload.replies_policy

      return apiInstance<Mastodon.List>({
        method: 'put',
        url: `lists/${params.payload.id}`,
        body
      }).then(res => res.body)
    case 'delete':
      return apiInstance<{}>({
        method: 'delete',
        url: `lists/${params.payload.id}`
      }).then(res => res.body)
  }
}

const useListsMutation = (
  options: UseMutationOptions<Mastodon.List, AxiosError, MutationVarsLists>
) => {
  return useMutation(mutationFunction, options)
}

/* ----- */

export type QueryKeyListAccounts = ['ListAccounts', { id: Mastodon.List['id'] }]

const accountsQueryFunction = async ({
  queryKey,
  pageParam
}: QueryFunctionContext<QueryKeyListAccounts>) => {
  const { id } = queryKey[1]

  return await apiInstance<Mastodon.Account[]>({
    method: 'get',
    url: `lists/${id}/accounts`,
    params: { ...pageParam, limit: 40 }
  })
}

const useListAccountsQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyListAccounts[1] & {
  options?: Omit<
    UseInfiniteQueryOptions<PagedResponse<Mastodon.Account[]>, AxiosError>,
    'getPreviousPageParam' | 'getNextPageParam'
  >
}) => {
  const queryKey: QueryKeyListAccounts = ['ListAccounts', queryKeyParams]
  return useInfiniteQuery(queryKey, accountsQueryFunction, {
    ...options,
    ...infinitePageParams
  })
}

type AccountsMutationVarsLists = {
  type: 'add' | 'delete'
  payload: Pick<Mastodon.List, 'id'> & { accounts: Mastodon.Account['id'][] }
}

const accountsMutationFunction = async (params: AccountsMutationVarsLists) => {
  const body: { account_ids?: string[] } = {}
  for (const account of params.payload.accounts) {
    body.account_ids = [account]
  }
  return apiInstance<{}>({
    method: params.type === 'add' ? 'post' : 'delete',
    url: `lists/${params.payload.id}/accounts`,
    body
  }).then(res => res.body)
}

const useListAccountsMutation = (
  options: UseMutationOptions<Mastodon.List, AxiosError, AccountsMutationVarsLists>
) => {
  return useMutation(accountsMutationFunction, options)
}

export { useListsQuery, useListsMutation, useListAccountsQuery, useListAccountsMutation }

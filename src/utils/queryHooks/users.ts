import {
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryOptions
} from '@tanstack/react-query'
import apiGeneral from '@utils/api/general'
import { PagedResponse } from '@utils/api/helpers'
import apiInstance from '@utils/api/instance'
import { appendRemote } from '@utils/helpers/appendRemote'
import { urlMatcher } from '@utils/helpers/urlMatcher'
import { TabSharedStackParamList } from '@utils/navigation/navigators'
import { AxiosError } from 'axios'
import { infinitePageParams } from './utils'

export type QueryKeyUsers = ['Users', TabSharedStackParamList['Tab-Shared-Users']]

const queryFunction = async ({ queryKey, pageParam }: QueryFunctionContext<QueryKeyUsers>) => {
  const page = queryKey[1]
  let params: { [key: string]: string } = { ...pageParam }

  switch (page.reference) {
    case 'statuses':
      return apiInstance<Mastodon.Account[]>({
        method: 'get',
        url: `statuses/${page.status.id}/${page.type}`,
        params
      })
    case 'accounts':
      const localInstance = page.account.username === page.account.acct
      if (localInstance) {
        return apiInstance<Mastodon.Account[]>({
          method: 'get',
          url: `accounts/${page.account.id}/${page.type}`,
          params
        })
      } else {
        let res: PagedResponse<Mastodon.Account[]>

        try {
          const domain = urlMatcher(page.account.url)?.domain
          if (!domain?.length) {
            throw new Error()
          }

          const resLookup = await apiGeneral<Mastodon.Account>({
            method: 'get',
            domain,
            url: 'api/v1/accounts/lookup',
            params: { acct: page.account.acct }
          })
          if (resLookup?.body) {
            res = await apiGeneral<Mastodon.Account[]>({
              method: 'get',
              domain,
              url: `api/v1/accounts/${resLookup.body.id}/${page.type}`,
              params
            })
            return {
              ...res,
              body: res.body.map(account => appendRemote.account(account, domain)),
              remoteData: true
            }
          } else {
            throw new Error()
          }
        } catch {
          res = await apiInstance<Mastodon.Account[]>({
            method: 'get',
            url: `${page.reference}/${page.account.id}/${page.type}`,
            params
          })
          return { ...res, warnIncomplete: true }
        }
      }
  }
}

const useUsersQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyUsers[1] & {
  options?: Omit<
    UseInfiniteQueryOptions<
      PagedResponse<Mastodon.Account[]> & { warnIncomplete: boolean; remoteData: boolean },
      AxiosError
    >,
    'getPreviousPageParam' | 'getNextPageParam'
  >
}) => {
  const queryKey: QueryKeyUsers = ['Users', { ...queryKeyParams }]
  return useInfiniteQuery(queryKey, queryFunction, {
    ...options,
    ...infinitePageParams
  })
}

export { useUsersQuery }

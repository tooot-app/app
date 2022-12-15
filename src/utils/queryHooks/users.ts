import apiInstance from '@api/instance'
import { TabSharedStackParamList } from '@utils/navigation/navigators'
import { AxiosError } from 'axios'
import {
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryOptions
} from '@tanstack/react-query'
import apiGeneral from '@api/general'
import { PagedResponse } from '@api/helpers'

export type QueryKeyUsers = ['Users', TabSharedStackParamList['Tab-Shared-Users']]

const queryFunction = async ({
  queryKey,
  pageParam,
  meta
}: QueryFunctionContext<QueryKeyUsers>) => {
  const page = queryKey[1]
  let params: { [key: string]: string } = { ...pageParam }

  switch (page.reference) {
    case 'statuses':
      return apiInstance<Mastodon.Account[]>({
        method: 'get',
        url: `${page.reference}/${page.status.id}/${page.type}`,
        params
      })
    case 'accounts':
      const localInstance = page.account.username === page.account.acct
      if (localInstance) {
        return apiInstance<Mastodon.Account[]>({
          method: 'get',
          url: `${page.reference}/${page.account.id}/${page.type}`,
          params
        })
      } else {
        let res: PagedResponse<Mastodon.Account[]>

        try {
          const domain = page.account.url.match(
            /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/i
          )?.[1]
          if (!domain?.length) {
            throw new Error()
          }

          const resSearch = await apiGeneral<{ accounts: Mastodon.Account[] }>({
            method: 'get',
            domain,
            url: 'api/v2/search',
            params: {
              q: `@${page.account.acct}`,
              type: 'accounts',
              limit: '1'
            }
          })
          if (resSearch?.body?.accounts?.length === 1) {
            res = await apiGeneral<Mastodon.Account[]>({
              method: 'get',
              domain,
              url: `api/v1/${page.reference}/${resSearch.body.accounts[0].id}/${page.type}`,
              params
            })
            return { ...res, remoteData: true }
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
  options?: UseInfiniteQueryOptions<
    PagedResponse<Mastodon.Account[]> & { warnIncomplete: boolean; remoteData: boolean },
    AxiosError
  >
}) => {
  const queryKey: QueryKeyUsers = ['Users', { ...queryKeyParams }]
  return useInfiniteQuery(queryKey, queryFunction, options)
}

export { useUsersQuery }

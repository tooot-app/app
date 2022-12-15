import apiInstance, { InstanceResponse } from '@api/instance'
import { TabSharedStackParamList } from '@utils/navigation/navigators'
import { AxiosError } from 'axios'
import {
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryOptions
} from '@tanstack/react-query'
import apiGeneral from '@api/general'

export type QueryKeyUsers = ['Users', TabSharedStackParamList['Tab-Shared-Users']]

const queryFunction = ({ queryKey, pageParam }: QueryFunctionContext<QueryKeyUsers>) => {
  const page = queryKey[1]
  let params: { [key: string]: string } = { ...pageParam }

  switch (page.reference) {
    case 'statuses':
      return apiInstance<Mastodon.Account[]>({
        method: 'get',
        url: `${page.reference}/${page.status.id}/${page.type}`,
        params
      }).then(res => ({ ...res, warnIncomplete: false }))
    case 'accounts':
      const localInstance = page.account.username === page.account.acct
      if (localInstance) {
        return apiInstance<Mastodon.Account[]>({
          method: 'get',
          url: `${page.reference}/${page.account.id}/${page.type}`,
          params
        }).then(res => ({ ...res, warnIncomplete: false }))
      } else {
        const domain = page.account.url.match(
          /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/i
        )?.[1]
        if (!domain) {
          return apiInstance<Mastodon.Account[]>({
            method: 'get',
            url: `${page.reference}/${page.account.id}/${page.type}`,
            params
          }).then(res => ({ ...res, warnIncomplete: true }))
        }
        return apiGeneral<{ accounts: Mastodon.Account[] }>({
          method: 'get',
          domain,
          url: 'api/v2/search',
          params: {
            q: `@${page.account.acct}`,
            type: 'accounts',
            limit: '1'
          }
        })
          .then(res => {
            if (res?.body?.accounts?.length === 1) {
              return apiGeneral<Mastodon.Account[]>({
                method: 'get',
                domain,
                url: `api/v1/${page.reference}/${res.body.accounts[0].id}/${page.type}`,
                params
              })
                .catch(() => {
                  return apiInstance<Mastodon.Account[]>({
                    method: 'get',
                    url: `${page.reference}/${page.account.id}/${page.type}`,
                    params
                  }).then(res => ({ ...res, warnIncomplete: true }))
                })
                .then(res => ({ ...res, warnIncomplete: false }))
            } else {
              return apiInstance<Mastodon.Account[]>({
                method: 'get',
                url: `${page.reference}/${page.account.id}/${page.type}`,
                params
              }).then(res => ({ ...res, warnIncomplete: true }))
            }
          })
          .catch(() => {
            return apiInstance<Mastodon.Account[]>({
              method: 'get',
              url: `${page.reference}/${page.account.id}/${page.type}`,
              params
            }).then(res => ({ ...res, warnIncomplete: true }))
          })
      }
  }
}

const useUsersQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyUsers[1] & {
  options?: UseInfiniteQueryOptions<
    InstanceResponse<Mastodon.Account[]> & { warnIncomplete: boolean },
    AxiosError
  >
}) => {
  const queryKey: QueryKeyUsers = ['Users', { ...queryKeyParams }]
  return useInfiniteQuery(queryKey, queryFunction, options)
}

export { useUsersQuery }

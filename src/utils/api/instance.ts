import { GLOBAL } from '@utils/storage'
import { getAccountDetails } from '@utils/storage/actions'
import { StorageGlobal } from '@utils/storage/global'
import axios, { AxiosRequestConfig } from 'axios'
import { ctx, handleError, PagedResponse, parseHeaderLinks, userAgent } from './helpers'
import { CONNECT_DOMAIN } from './helpers/connect'

export type Params = {
  account?: StorageGlobal['account.active']
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  version?: 'v1' | 'v2'
  url: string
  params?: {
    [key: string]: string | number | boolean | string[] | number[] | boolean[]
  }
  headers?: { [key: string]: string }
  body?: FormData | Object
  extras?: Omit<AxiosRequestConfig, 'method' | 'baseURL' | 'url' | 'params' | 'headers' | 'data'>
}

const apiInstance = async <T = unknown>({
  account,
  method,
  version = 'v1',
  url,
  params,
  headers,
  body,
  extras
}: Params): Promise<PagedResponse<T>> => {
  const accountDetails = getAccountDetails(['auth.domain', 'auth.token'], account)
  if (!accountDetails) {
    console.warn(ctx.bgRed.white.bold(' API instance '), 'No account detail available')
    return Promise.reject()
  }

  if (!accountDetails['auth.domain'] || !accountDetails['auth.token']) {
    console.warn(ctx.bgRed.white.bold(' API ') + ' ' + 'No domain or token available')
    return Promise.reject()
  }

  console.log(
    ctx.bgBlue.bold(' Instance '),
    accountDetails['auth.domain'],
    method + ctx.blue(' -> ') + `/${url}` + (params ? ctx.blue(' -> ') : ''),
    params ? params : ''
  )

  return axios({
    timeout: method === 'post' ? 1000 * 60 : 1000 * 15,
    method,
    baseURL: `https://${
      GLOBAL.connect ? CONNECT_DOMAIN() : accountDetails['auth.domain']
    }/api/${version}`,
    url,
    params,
    headers: {
      Accept: 'application/json',
      ...userAgent,
      ...headers,
      Authorization: `Bearer ${accountDetails['auth.token']}`,
      ...(body && body instanceof FormData && { 'Content-Type': 'multipart/form-data' }),
      ...(GLOBAL.connect && { 'x-tooot-domain': accountDetails['auth.domain'] })
    },
    data: body,
    ...extras
  })
    .then(response => ({ body: response.data, links: parseHeaderLinks(response.headers.link) }))
    .catch(handleError())
}

export default apiInstance

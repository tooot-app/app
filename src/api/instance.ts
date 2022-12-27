import { getAccountDetails } from '@utils/storage/actions'
import axios, { AxiosRequestConfig } from 'axios'
import { ctx, handleError, PagedResponse, userAgent } from './helpers'

export type Params = {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  version?: 'v1' | 'v2'
  url: string
  params?: {
    [key: string]: string | number | boolean | string[] | number[] | boolean[]
  }
  headers?: { [key: string]: string }
  body?: FormData
  extras?: Omit<AxiosRequestConfig, 'method' | 'url' | 'params' | 'headers' | 'data'>
}

const apiInstance = async <T = unknown>({
  method,
  version = 'v1',
  url,
  params,
  headers,
  body,
  extras
}: Params): Promise<PagedResponse<T>> => {
  const accountDetails = getAccountDetails(['auth.domain', 'auth.token'])
  if (!accountDetails) {
    console.warn(ctx.bgRed.white.bold(' API ') + ' ' + 'No account detail available')
    return Promise.reject()
  }

  if (!accountDetails['auth.domain'] || !accountDetails['auth.token']) {
    console.warn(ctx.bgRed.white.bold(' API ') + ' ' + 'No domain or token available')
    return Promise.reject()
  }

  console.log(
    ctx.bgGreen.bold(' API instance ') +
      ' ' +
      accountDetails['auth.domain'] +
      ' ' +
      method +
      ctx.green(' -> ') +
      `/${url}` +
      (params ? ctx.green(' -> ') : ''),
    params ? params : ''
  )

  return axios({
    timeout: method === 'post' ? 1000 * 60 : 1000 * 15,
    method,
    baseURL: `https://${accountDetails['auth.domain']}/api/${version}/`,
    url,
    params,
    headers: {
      'Content-Type': body && body instanceof FormData ? 'multipart/form-data' : 'application/json',
      Accept: '*/*',
      ...userAgent,
      ...headers,
      Authorization: `Bearer ${accountDetails['auth.token']}`
    },
    ...((body as (FormData & { _parts: [][] }) | undefined)?._parts.length && { data: body }),
    ...extras
  })
    .then(response => {
      let links: {
        prev?: { id: string; isOffset: boolean }
        next?: { id: string; isOffset: boolean }
      } = {}

      if (response.headers?.link) {
        const linksParsed = response.headers.link.matchAll(
          new RegExp('[?&](.*?_id|offset)=(.*?)>; *rel="(.*?)"', 'gi')
        )
        for (const link of linksParsed) {
          switch (link[3]) {
            case 'prev':
              links.prev = { id: link[2], isOffset: link[1].includes('offset') }
              break
            case 'next':
              links.next = { id: link[2], isOffset: link[1].includes('offset') }
              break
          }
        }
      }
      return Promise.resolve({ body: response.data, links })
    })
    .catch(handleError())
}

export default apiInstance

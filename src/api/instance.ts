import { RootState } from '@root/store'
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
  const { store } = require('@root/store')
  const state = store.getState() as RootState
  const instanceActive = state.instances.instances.findIndex(instance => instance.active)

  let domain
  let token
  if (instanceActive !== -1 && state.instances.instances[instanceActive]) {
    domain = state.instances.instances[instanceActive].url
    token = state.instances.instances[instanceActive].token
  } else {
    console.warn(ctx.bgRed.white.bold(' API ') + ' ' + 'No instance domain is provided')
    return Promise.reject()
  }

  console.log(
    ctx.bgGreen.bold(' API instance ') +
      ' ' +
      domain +
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
    baseURL: `https://${domain}/api/${version}/`,
    url,
    params,
    headers: {
      'Content-Type': body && body instanceof FormData ? 'multipart/form-data' : 'application/json',
      Accept: '*/*',
      ...userAgent,
      ...headers,
      ...(token && {
        Authorization: `Bearer ${token}`
      })
    },
    ...(body && { data: body }),
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

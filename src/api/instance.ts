import { RootState } from '@root/store'
import axios, { AxiosRequestConfig } from 'axios'
import Constants from 'expo-constants'
import li from 'li'
import handleError, { ctx } from './handleError'

export type Params = {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  version?: 'v1' | 'v2'
  url: string
  params?: {
    [key: string]: string | number | boolean | string[] | number[] | boolean[]
  }
  headers?: { [key: string]: string }
  body?: FormData
  extras?: Omit<
    AxiosRequestConfig,
    'method' | 'url' | 'params' | 'headers' | 'data'
  >
}

export type InstanceResponse<T = unknown> = {
  body: T
  links: { prev?: string; next?: string }
}

const apiInstance = async <T = unknown>({
  method,
  version = 'v1',
  url,
  params,
  headers,
  body,
  extras
}: Params): Promise<InstanceResponse<T>> => {
  const { store } = require('@root/store')
  const state = store.getState() as RootState
  const instanceActive = state.instances.instances.findIndex(
    instance => instance.active
  )

  let domain
  let token
  if (instanceActive !== -1 && state.instances.instances[instanceActive]) {
    domain = state.instances.instances[instanceActive].url
    token = state.instances.instances[instanceActive].token
  } else {
    console.warn(
      ctx.bgRed.white.bold(' API ') + ' ' + 'No instance domain is provided'
    )
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
      'Content-Type':
        body && body instanceof FormData
          ? 'multipart/form-data'
          : 'application/json',
      'User-Agent': `tooot/${Constants.manifest?.version}`,
      Accept: '*/*',
      ...headers,
      ...(token && {
        Authorization: `Bearer ${token}`
      })
    },
    ...(body && { data: body }),
    ...extras
  })
    .then(response => {
      let prev
      let next
      if (response.headers.link) {
        const headersLinks = li.parse(response.headers.link)
        prev = headersLinks.prev?.match(/_id=([0-9]*)/)[1]
        next = headersLinks.next?.match(/_id=([0-9]*)/)[1]
      }
      return Promise.resolve({
        body: response.data,
        links: { prev, next }
      })
    })
    .catch(handleError)
}

export default apiInstance

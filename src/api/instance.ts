import { RootState } from '@root/store'
import axios, { AxiosRequestConfig } from 'axios'
import chalk from 'chalk'
import Constants from 'expo-constants'
import li from 'li'
import * as Sentry from 'sentry-expo'

const ctx = new chalk.Instance({ level: 3 })

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
      'Content-Type': 'application/json',
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
    .catch(error => {
      if (Math.random() < 0.001) {
        Sentry.Native.setExtras({
          API: 'instance',
          ...(error.response && { response: error.response }),
          ...(error.request && { request: error.request })
        })
        Sentry.Native.captureException(error)
      }

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          ctx.bold(' API instance '),
          ctx.bold('response'),
          error.response.status,
          error.response.data.error
        )
        return Promise.reject({
          status: error.response.status,
          message: error.response.data.error
        })
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(ctx.bold(' API instance '), ctx.bold('request'), error)
        return Promise.reject()
      } else {
        console.error(
          ctx.bold(' API instance '),
          ctx.bold('internal'),
          error.message,
          url
        )
        return Promise.reject()
      }
    })
}

export default apiInstance

import { mapEnvironment } from '@utils/checkEnvironment'
import axios from 'axios'
import Constants from 'expo-constants'
import * as Sentry from 'sentry-expo'
import handleError, { ctx } from './handleError'

export type Params = {
  method: 'get' | 'post' | 'put' | 'delete'
  url: string
  params?: {
    [key: string]: string | number | boolean | string[] | number[] | boolean[]
  }
  headers?: { [key: string]: string }
  body?: FormData | Object
  sentry?: boolean
}

export const TOOOT_API_DOMAIN = mapEnvironment({
  release: 'api.tooot.app',
  candidate: 'api-candidate.tooot.app',
  development: 'api-development.tooot.app'
})

const apiTooot = async <T = unknown>({
  method,
  url,
  params,
  headers,
  body,
  sentry = true
}: Params): Promise<{ body: T }> => {
  console.log(
    ctx.bgGreen.bold(' API tooot ') +
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
    baseURL: `https://${TOOOT_API_DOMAIN}/`,
    url: `${url}`,
    params,
    headers: {
      'Content-Type':
        body && body instanceof FormData
          ? 'multipart/form-data'
          : 'application/json',
      'User-Agent': `tooot/${Constants.manifest?.version}`,
      Accept: '*/*',
      ...headers
    },
    ...(body && { data: body }),
    validateStatus: status =>
      url.includes('translate') ? status < 500 : status === 200
  })
    .then(response => {
      return Promise.resolve({
        body: response.data
      })
    })
    .catch(error => {
      if (sentry) {
        Sentry.Native.setExtras({
          API: 'tooot',
          ...(error?.response && { response: error.response }),
          ...(error?.request && { request: error.request })
        })
        Sentry.Native.captureException(error)
      }

      return handleError(error)
    })
}

export default apiTooot

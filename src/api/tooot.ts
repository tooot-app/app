import * as Sentry from '@sentry/react-native'
import { mapEnvironment } from '@utils/checkEnvironment'
import axios from 'axios'
import { ctx, handleError, userAgent } from './helpers'

export type Params = {
  method: 'get' | 'post' | 'put' | 'delete'
  url: string
  params?: {
    [key: string]: string | number | boolean | string[] | number[] | boolean[]
  }
  headers?: { [key: string]: string }
  body?: FormData | Object
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
  body
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
      'Content-Type': body && body instanceof FormData ? 'multipart/form-data' : 'application/json',
      Accept: '*/*',
      ...userAgent,
      ...headers
    },
    ...(body && { data: body })
  })
    .then(response => {
      return Promise.resolve({
        body: response.data
      })
    })
    .catch(error => {
      Sentry.setContext('API request', { url, params, body })
      Sentry.setContext('Error response', {
        ...(error?.response && { response: error.response?._response })
      })
      Sentry.setContext('Error object', { error })
      Sentry.captureMessage('API error')

      return handleError(error)
    })
}

export default apiTooot

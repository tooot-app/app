import axios from 'axios'
import chalk from 'chalk'
import { Constants } from 'react-native-unimodules'
import * as Sentry from 'sentry-expo'

const ctx = new chalk.Instance({ level: 3 })

export type Params = {
  service: 'push' | 'translate'
  method: 'get' | 'post'
  url: string
  params?: {
    [key: string]: string | number | boolean | string[] | number[] | boolean[]
  }
  headers?: { [key: string]: string }
  body?: FormData | Object
  sentry?: boolean
}

const DOMAIN = __DEV__ ? 'testapi.tooot.app' : 'api.tooot.app'

const apiTooot = async <T = unknown>({
  service,
  method,
  url,
  params,
  headers,
  body,
  sentry = false
}: Params): Promise<{ body: T }> => {
  const key = Constants.manifest.extra?.toootApiKey

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
    baseURL: `https://${DOMAIN}/`,
    url: `${service}/${url}`,
    params,
    headers: {
      ...(key && { 'x-tooot-key': key }),
      'Content-Type': 'application/json',
      'User-Agent': `tooot/${Constants.manifest.version}`,
      Accept: '*/*',
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
      if (sentry) {
        Sentry.Native.setExtras(error.response)
        Sentry.Native.captureException(error)
      }

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          ctx.bold(' API tooot '),
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
        console.error(
          ctx.bold(' API tooot '),
          ctx.bold('request'),
          error.request
        )
        return Promise.reject()
      } else {
        console.error(
          ctx.bold(' API tooot '),
          ctx.bold('internal'),
          error.message,
          url
        )
        return Promise.reject()
      }
    })
}

export default apiTooot

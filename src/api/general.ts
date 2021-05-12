import axios from 'axios'
import chalk from 'chalk'
import * as Sentry from 'sentry-expo'

const ctx = new chalk.Instance({ level: 3 })

export type Params = {
  method: 'get' | 'post' | 'put' | 'delete'
  domain: string
  url: string
  params?: {
    [key: string]: string | number | boolean | string[] | number[] | boolean[]
  }
  headers?: { [key: string]: string }
  body?: FormData | Object
  sentry?: boolean
}

const apiGeneral = async <T = unknown>({
  method,
  domain,
  url,
  params,
  headers,
  body,
  sentry = false
}: Params): Promise<{ body: T }> => {
  console.log(
    ctx.bgGreen.bold(' API general ') +
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
    baseURL: `https://${domain}/`,
    url,
    params,
    headers: {
      'Content-Type': 'application/json',
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
          ctx.bold(' API general '),
          ctx.bold('response'),
          error.response.status,
          error.response.data.error
        )
        return Promise.reject(error.response)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(ctx.bold(' API general '), ctx.bold('request'), error)
        return Promise.reject()
      } else {
        console.error(
          ctx.bold(' API general '),
          ctx.bold('internal'),
          error.message,
          url
        )
        return Promise.reject()
      }
    })
}

export default apiGeneral

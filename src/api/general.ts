import axios from 'axios'
import Constants from 'expo-constants'
import handleError, { ctx } from './handleError'

export type Params = {
  method: 'get' | 'post' | 'put' | 'delete'
  domain: string
  url: string
  params?: {
    [key: string]: string | number | boolean | string[] | number[] | boolean[]
  }
  headers?: { [key: string]: string }
  body?: FormData | Object
}

const apiGeneral = async <T = unknown>({
  method,
  domain,
  url,
  params,
  headers,
  body
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
      'Content-Type':
        body && body instanceof FormData
          ? 'multipart/form-data'
          : 'application/json',
      'User-Agent': `tooot/${Constants.manifest?.version}`,
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
    .catch(handleError)
}

export default apiGeneral

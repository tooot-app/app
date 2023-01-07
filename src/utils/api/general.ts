import axios from 'axios'
import { ctx, handleError, PagedResponse, parseHeaderLinks, userAgent } from './helpers'

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
}: Params): Promise<PagedResponse<T>> => {
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
      'Content-Type': body && body instanceof FormData ? 'multipart/form-data' : 'application/json',
      Accept: '*/*',
      ...userAgent,
      ...headers
    },
    ...(body &&
      (body instanceof FormData
        ? (body as (FormData & { _parts: [][] }) | undefined)?._parts?.length
        : Object.keys(body).length) && { data: body })
  })
    .then(response => ({ body: response.data, links: parseHeaderLinks(response.headers.link) }))
    .catch(handleError())
}

export default apiGeneral

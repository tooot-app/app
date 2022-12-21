import axios from 'axios'
import { ctx, handleError, PagedResponse, userAgent } from './helpers'

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

export default apiGeneral

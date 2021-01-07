import { RootState } from '@root/store'
import axios from 'axios'
import chalk from 'chalk'

const ctx = new chalk.Instance({ level: 3 })

const client = async <T = unknown>({
  method,
  instance,
  localIndex,
  instanceDomain,
  version = 'v1',
  url,
  params,
  headers,
  body,
  onUploadProgress
}: {
  method: 'get' | 'post' | 'put' | 'delete'
  instance: 'local' | 'remote'
  localIndex?: number
  instanceDomain?: string
  version?: 'v1' | 'v2'
  url: string
  params?: {
    [key: string]: string | number | boolean
  }
  headers?: { [key: string]: string }
  body?: FormData
  onUploadProgress?: (progressEvent: any) => void
}): Promise<T> => {
  const { store } = require('@root/store')
  const state = (store.getState() as RootState).instances
  const theLocalIndex =
    localIndex !== undefined ? localIndex : state.local.activeIndex

  let domain = null
  if (instance === 'remote') {
    domain = instanceDomain || state.remote.url
  } else {
    if (theLocalIndex !== null && state.local.instances[theLocalIndex]) {
      domain = state.local.instances[theLocalIndex].url
    } else {
      console.error(
        ctx.bgRed.white.bold(' API ') + ' ' + 'No instance domain is provided'
      )
      return Promise.reject()
    }
  }

  console.log(
    ctx.bgGreen.bold(' API ') +
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
      ...headers,
      ...(instance === 'local' && {
        Authorization: `Bearer ${state.local!.instances[theLocalIndex!].token}`
      })
    },
    ...(body && { data: body }),
    ...(onUploadProgress && { onUploadProgress: onUploadProgress })
  })
    .then(response => Promise.resolve(response.data))
    .catch(error => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          ctx.bold(' API '),
          ctx.bold('response'),
          error.response.status,
          error.response.data.error,
          error.request
        )
        return Promise.reject(error.response)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(ctx.bold(' API '), ctx.bold('request'), error)
        return Promise.reject()
      } else {
        console.error(ctx.bold(' API '), ctx.bold('other'), error.message)
        return Promise.reject({ body: error.message })
      }
    })
}

export default client

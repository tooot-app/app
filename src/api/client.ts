import axios from 'axios'
import chalk from 'chalk'
import { store, RootState } from '@root/store'

const ctx = new chalk.Instance({ level: 3 })

const client = async ({
  method,
  instance,
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
  instanceDomain?: string
  version?: 'v1' | 'v2'
  url: string
  params?: {
    [key: string]: string | number | boolean
  }
  headers?: { [key: string]: string }
  body?: FormData
  onUploadProgress?: (progressEvent: any) => void
}): Promise<any> => {
  console.log(
    ctx.bgGreen.bold(' API ') +
      ' ' +
      method +
      ctx.green(' -> ') +
      `/${url}` +
      (params ? ctx.green(' -> ') : ''),
    params ? params : ''
  )
  const state: RootState['instances'] = store.getState().instances
  const domain =
    instance === 'remote' ? instanceDomain || state.remote.url : state.local.url

  return axios({
    method,
    baseURL: `https://${domain}/api/${version}/`,
    url,
    params,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(instance === 'local' && {
        Authorization: `Bearer ${state.local.token}`
      })
    },
    ...(body && { data: body }),
    ...(onUploadProgress && { onUploadProgress: onUploadProgress })
  })
    .then(response =>
      Promise.resolve({
        headers: response.headers,
        body: response.data
      })
    )
    .catch(error => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('axios error', error.response)
        return Promise.reject({
          headers: error.response.headers,
          body: error.response.data.error
        })
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error('axios error', error)
        return Promise.reject()
      } else {
        console.error('axios error', error.message)
        return Promise.reject({ body: error.message })
      }
    })
}

export default client

import store, { RootState } from 'src/store'
import ky from 'ky'

const client = async ({
  version = 'v1',
  method,
  instance,
  instanceUrl,
  endpoint,
  headers,
  query,
  body
}: {
  version?: 'v1' | 'v2'
  method: 'get' | 'post' | 'put' | 'delete'
  instance: 'local' | 'remote'
  instanceUrl?: string
  endpoint: string
  headers?: { [key: string]: string }
  query?: {
    [key: string]: string | number | boolean
  }
  body?: FormData
}): Promise<any> => {
  const state: RootState['instances'] = store.getState().instances
  const url =
    instance === 'remote' ? instanceUrl || state.remote.url : state.local.url

  let response
  // try {
  response = await ky(endpoint, {
    method: method,
    prefixUrl: `https://${url}/api/${version}`,
    searchParams: query,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(instance === 'local' && {
        Authorization: `Bearer ${state.local.token}`
      })
    },
    ...(body && { body: body }),
    throwHttpErrors: false
  })
  // } catch (error) {
  //   return Promise.reject('ky error: ' + error.json())
  // }
  console.log('upload done')
  if (response?.ok) {
    console.log('returning ok')
    return Promise.resolve({
      headers: response.headers,
      body: await response.json()
    })
  } else {
    let errorResponse
    try {
      errorResponse = await response.json()
    } catch (error) {
      return Promise.reject({ body: 'Nothing found' })
    }
    console.error(response.status + ': ' + errorResponse.error)
    return Promise.reject({ body: errorResponse.error })
  }
}

export default client

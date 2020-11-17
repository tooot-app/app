import store, { RootState } from 'src/stacks/common/store'
import ky from 'ky'

const client = async ({
  version = 'v1',
  method,
  instance,
  endpoint,
  headers,
  query,
  body
}: {
  version?: 'v1' | 'v2'
  method: 'get' | 'post' | 'delete'
  instance: 'local' | 'remote'
  endpoint: string
  headers?: { [key: string]: string }
  query?: {
    [key: string]: string | number | boolean
  }
  body?: FormData
}): Promise<any> => {
  const state: RootState['instanceInfo'] = store.getState().instanceInfo

  let response
  // try {
  response = await ky(endpoint, {
    method: method,
    prefixUrl: `https://${state[instance]}/api/${version}`,
    searchParams: query,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(instance === 'local' && {
        Authorization: `Bearer ${state.localToken}`
      })
    },
    ...(body && { body: body }),
    throwHttpErrors: false
  })
  // } catch (error) {
  //   return Promise.reject('ky error: ' + error.json())
  // }

  if (response.ok) {
    return Promise.resolve({
      headers: response.headers,
      body: await response.json()
    })
  } else {
    const errorResponse = await response.json()
    console.error(response.status + ': ' + errorResponse.error)
    return Promise.reject({ body: errorResponse.error })
  }
}

export default client

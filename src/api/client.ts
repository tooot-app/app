import store, { RootState } from 'src/stacks/common/store'
import ky from 'ky'

const client = async ({
  method,
  instance,
  endpoint,
  query,
  body
}: {
  method: 'get' | 'post' | 'delete'
  instance: 'local' | 'remote'
  endpoint: string
  query?: {
    [key: string]: string | number | boolean
  }
  body?: object
}): Promise<any> => {
  const state: RootState["instanceInfo"] = store.getState().instanceInfo

  let response
  try {
    response = await ky(endpoint, {
      method: method,
      prefixUrl: `https://${state[instance]}/api/v1`,
      searchParams: query,
      headers: {
        'Content-Type': 'application/json',
        ...(instance === 'local' && {
          Authorization: `Bearer ${state.localToken}`
        })
      },
      ...(body && { json: body })
    })
  } catch {
    return Promise.reject('ky error')
  }

  if (response.ok) {
    return Promise.resolve({
      headers: response.headers,
      body: await response.json()
    })
  } else {
    console.error(response.status + ': ' + response.statusText)
    return Promise.reject({ body: response.statusText })
  }
}

export default client

import store from 'src/stacks/common/store'
import ky from 'ky'

export default async function client ({
  method, // *  get / post
  instance, // *  local / remote
  endpoint, // *  if url is empty
  query, //    object
  body //    object
}) {
  const state = store.getState().instanceInfo

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
    console.error(response.error)
    return Promise.reject({ body: response.error_message })
  }
}

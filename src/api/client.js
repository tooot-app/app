export async function client (
  instance,
  endpoint,
  query,
  { body, ...customConfig } = {}
) {
  if (!instance || !endpoint) {
    console.error('Missing instance or endpoint.')
    return Promise.reject('Missing instance or endpoint.')
  }
  const headers = { 'Content-Type': 'application/json' }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers
    }
  }

  if (body) {
    config.body = JSON.stringify(body)
  }
  let data
  try {
    const response = await fetch(
      `https://${instance}/api/v1/${endpoint}${
        query
          ? `?${Object.keys(query)
              .map(key => `${key}=${query[key]}`)
              .join('&')}`
          : ''
      }`,
      config
    )
    data = await response.json()
    if (response.ok) {
      return data
    }
    throw new Error(response.statusText)
  } catch (err) {
    return Promise.reject(err.message ? err.message : data)
  }
}

client.get = function (instance, endpoint, query, customConfig = {}) {
  return client(instance, endpoint, query, { ...customConfig, method: 'GET' })
}

client.post = function (instance, endpoint, query, body, customConfig = {}) {
  return client(instance, endpoint, query, { ...customConfig, body })
}

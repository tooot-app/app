export async function client (url, query, { body, ...customConfig } = {}) {
  if (!url) {
    return Promise.reject('Missing URL.')
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

  const queryString = query
    ? `?${query.map(({ key, value }) => `${key}=${value}`).join('&')}`
    : ''

  if (body) {
    config.body = JSON.stringify(body)
  }

  let data
  try {
    const response = await fetch(`${url}${queryString}`, config)
    data = await response.json()
    if (response.ok) {
      return { headers: response.headers, body: data }
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

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
    ? `?${Object.keys(query)
        .map(key => `${key}=${query[key]}`)
        .join('&')}`
    : ''

  if (body) {
    config.body = JSON.stringify(body)
  }

  let data
  try {
    const response = await fetch(`https://${url}${queryString}`, config)
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

import chalk from 'chalk'

export const ctx = new chalk.Instance({ level: 3 })

const handleError = (error: any) => {
  if (error?.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(
      ctx.bold(' API '),
      ctx.bold('response'),
      error.response.status,
      error?.response.data?.error || error?.response.message || 'Unknown error'
    )
    return Promise.reject({
      status: error?.response.status,
      message: error?.response.data?.error || error?.response.message || 'Unknown error'
    })
  } else if (error?.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.error(ctx.bold(' API '), ctx.bold('request'), error)
    return Promise.reject()
  } else {
    console.error(ctx.bold(' API '), ctx.bold('internal'), error?.message)
    return Promise.reject()
  }
}

export default handleError

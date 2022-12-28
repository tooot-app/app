import * as Sentry from '@sentry/react-native'
import chalk from 'chalk'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

const userAgent = {
  'User-Agent': `tooot/${Constants.expoConfig?.version} ${Platform.OS}/${Platform.Version}`
}

const ctx = new chalk.Instance({ level: 3 })
const handleError =
  (
    config: {
      message: string
      captureRequest?: { url: string; params: any; body: any }
      captureResponse?: boolean
    } | void
  ) =>
  (error: any) => {
    const shouldReportToSentry = config && (config.captureRequest || config.captureResponse)
    shouldReportToSentry && Sentry.setContext('Error object', error)

    if (config?.captureRequest) {
      Sentry.setContext('Error request', config.captureRequest)
    }

    if (error?.response) {
      if (config?.captureResponse) {
        Sentry.setContext('Error response', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        })
      }

      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(
        ctx.bold(' API '),
        ctx.bold('response'),
        error.response.status,
        error.request._url,
        error?.response.data?.error || error?.response.message || 'Unknown error'
      )

      shouldReportToSentry && Sentry.captureMessage(config.message)
      return Promise.reject({
        status: error?.response.status,
        message: error?.response.data?.error || error?.response.message || 'Unknown error'
      })
    } else if (error?.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error(ctx.bold(' API '), ctx.bold('request'), error)

      shouldReportToSentry && Sentry.captureMessage(config.message)
      return Promise.reject(error)
    } else {
      console.error(ctx.bold(' API '), ctx.bold('internal'), error?.message)

      shouldReportToSentry && Sentry.captureMessage(config.message)
      return Promise.reject(error)
    }
  }

type LinkFormat = { id: string; isOffset: boolean }
export type PagedResponse<T = unknown> = {
  body: T
  links: { prev?: LinkFormat; next?: LinkFormat }
}

export { ctx, handleError, userAgent }

import * as Sentry from '@sentry/react-native'
import { GLOBAL } from '@utils/storage'
import chalk from 'chalk'
import Constants from 'expo-constants'
import * as Linking from 'expo-linking'
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
    if (GLOBAL.connect) {
      if (error?.response?.status == 403 && error?.response?.data == 'connect_blocked') {
        GLOBAL.connect = false
      }
    }
    const shouldReportToSentry = config && (config.captureRequest || config.captureResponse)
    shouldReportToSentry && Sentry.setContext('Error object', error)

    if (config?.captureRequest) {
      Sentry.setContext('Error request', config.captureRequest)
    }

    if (error?.response) {
      if (config?.captureResponse) {
        Sentry.setTag('error_status', error.response.status)
        Sentry.setContext('Error response', {
          data: error.response.data,
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

export const parseHeaderLinks = (headerLink?: string): PagedResponse['links'] => {
  if (!headerLink) return undefined

  const links: PagedResponse['links'] = {}

  const linkParsed = [...headerLink.matchAll(/<(\S+?)>; *rel="(next|prev)"/gi)]
  for (const link of linkParsed) {
    const queries = Linking.parse(link[1]).queryParams
    if (!queries) return

    const isOffset = !!queries.offset?.length
    const unwrapArray = (value: any | any[]) => (Array.isArray(value) ? value[0] : value)

    switch (link[2]) {
      case 'prev':
        const prevId = isOffset ? queries.offset : queries.min_id
        if (prevId)
          links.prev = isOffset ? { offset: unwrapArray(prevId) } : { min_id: unwrapArray(prevId) }
        break
      case 'next':
        const nextId = isOffset ? queries.offset : queries.max_id
        if (nextId)
          links.next = isOffset ? { offset: unwrapArray(nextId) } : { max_id: unwrapArray(nextId) }
        break
    }
  }

  if (links.prev || links.next) {
    return links
  } else {
    return undefined
  }
}

export type PagedResponse<T = unknown> = {
  body: T
  links?: {
    prev?: { min_id: string } | { offset: string }
    next?: { max_id: string } | { offset: string }
  }
}

export { ctx, handleError, userAgent }

import { QueryClient } from '@tanstack/react-query'

export const globalRetry = (failureCount: number) => failureCount <= 2

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error: any) => {
        if ([401, 404].includes(error?.status)) {
          return false
        }

        return globalRetry(failureCount)
      }
    }
  }
})

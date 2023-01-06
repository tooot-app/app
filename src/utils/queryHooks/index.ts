import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error: any) => {
        if ([401, 404].includes(error?.status)) {
          return false
        }
        if (failureCount <= 3) {
          return true
        } else {
          return false
        }
      }
    }
  },
  logger: {
    log: log => console.log(log),
    warn: () => {},
    error: () => {}
  }
})

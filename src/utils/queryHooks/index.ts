import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error: any) => {
        if (error?.status === 404) {
          return false
        }
        if (failureCount <= 3) {
          return true
        } else {
          return false
        }
      }
    }
  }
})

// @ts-ignore
import('react-query-native-devtools').then(({ addPlugin }) => {
  addPlugin({ queryClient })
})

export default queryClient

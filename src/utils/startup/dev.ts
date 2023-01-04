import { queryClient } from '@utils/queryHooks'
import log from './log'

export const dev = () => {
  if (__DEV__) {
    log('log', 'dev', 'loading tools')
    // @ts-ignore
    // import('react-query-native-devtools').then(({ addPlugin }) => {
    //   addPlugin({ queryClient })
    // })
  }
}

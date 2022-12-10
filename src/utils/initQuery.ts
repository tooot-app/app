import queryClient from '@helpers/queryClient'
import { store } from '@root/store'
import { InstanceLatest } from './migrations/instances/migration'
import { updateInstanceActive } from './slices/instancesSlice'

const initQuery = async ({ instance }: { instance: InstanceLatest }) => {
  store.dispatch(updateInstanceActive(instance))
  await queryClient.resetQueries()
}

export default initQuery

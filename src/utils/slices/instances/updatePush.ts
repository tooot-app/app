import { createAsyncThunk } from '@reduxjs/toolkit'
import { InstanceLatest } from '@utils/migrations/instances/migration'
import { getGlobalStorage } from '@utils/storage/actions'
import pushRegister from './push/register'
import pushUnregister from './push/unregister'

export const updateInstancePush = createAsyncThunk(
  'instances/updatePush',
  async (
    disable: boolean,
    { getState }
  ): Promise<InstanceLatest['push']['keys']['auth'] | undefined> => {
    const expoToken = getGlobalStorage.string('app.expo_token')
    if (!expoToken.length) {
      return Promise.reject()
    }

    if (disable) {
      return await pushRegister()
    } else {
      return await pushUnregister()
    }
  }
)

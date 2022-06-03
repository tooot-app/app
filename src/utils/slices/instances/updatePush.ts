import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import { InstanceLatest } from '@utils/migrations/instances/migration'
import pushRegister from './push/register'
import pushUnregister from './push/unregister'

export const updateInstancePush = createAsyncThunk(
  'instances/updatePush',
  async (
    disable: boolean,
    { getState }
  ): Promise<InstanceLatest['push']['keys']['auth'] | undefined> => {
    const state = getState() as RootState
    const expoToken = state.app.expoToken
    if (!expoToken) {
      return Promise.reject()
    }

    if (disable) {
      return await pushRegister(state, expoToken)
    } else {
      return await pushUnregister(state, expoToken)
    }
  }
)

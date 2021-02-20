import { createAsyncThunk } from '@reduxjs/toolkit'
import { Instance } from '../instancesSlice'
import pushDisable from './push/disable'
import pushEnable from './push/enable'

export const updatePush = createAsyncThunk(
  'instances/updatePush',
  async (
    enable: boolean
  ): Promise<Instance['push']['subscription'] | boolean> => {
    if (enable) {
      return pushEnable()
    } else {
      return pushDisable()
    }
  }
)

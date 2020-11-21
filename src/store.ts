import { configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import createSecureStore from 'redux-persist-expo-securestore'

import instancesSlice from 'src/utils/slices/instancesSlice'

const secureStorage = createSecureStore()

const instancesPersistConfig = {
  key: 'instances',
  storage: secureStorage
}

const store = configureStore({
  reducer: {
    instances: persistReducer(instancesPersistConfig, instancesSlice)
  }
})

let persistor = persistStore(store)

export { store, persistor }
export type RootState = ReturnType<typeof store.getState>

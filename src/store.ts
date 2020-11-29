import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import createSecureStore from 'redux-persist-expo-securestore'

import instancesSlice from 'src/utils/slices/instancesSlice'
import settingsSlice from 'src/utils/slices/settingsSlice'

const secureStorage = createSecureStore()

const instancesPersistConfig = {
  key: 'instances',
  storage: secureStorage
}

const settingsPersistConfig = {
  key: 'settings',
  storage: secureStorage
}

const store = configureStore({
  reducer: {
    instances: persistReducer(instancesPersistConfig, instancesSlice),
    settings: persistReducer(settingsPersistConfig, settingsSlice)
  },
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['persist/PERSIST']
    }
  })
})

let persistor = persistStore(store)

export { store, persistor }
export type RootState = ReturnType<typeof store.getState>

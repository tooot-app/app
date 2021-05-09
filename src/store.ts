import createSecureStore from '@neverdull-agency/expo-unlimited-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import instancesMigration from '@utils/migrations/instances/migration'
import contextsSlice from '@utils/slices/contextsSlice'
import instancesSlice from '@utils/slices/instancesSlice'
import settingsSlice from '@utils/slices/settingsSlice'
import versionSlice from '@utils/slices/versionSlice'
import { createMigrate, persistReducer, persistStore } from 'redux-persist'

const secureStorage = createSecureStore()

const prefix = 'tooot'

const contextsPersistConfig = {
  key: 'contexts',
  prefix,
  storage: AsyncStorage
}

const instancesPersistConfig = {
  key: 'instances',
  prefix,
  storage: secureStorage,
  version: 5,
  // @ts-ignore
  migrate: createMigrate(instancesMigration)
}

const settingsPersistConfig = {
  key: 'settings',
  prefix,
  storage: AsyncStorage
}

const store = configureStore({
  reducer: {
    contexts: persistReducer(contextsPersistConfig, contextsSlice),
    instances: persistReducer(instancesPersistConfig, instancesSlice),
    settings: persistReducer(settingsPersistConfig, settingsSlice),
    version: versionSlice
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

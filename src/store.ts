import createSecureStore from '@neverdull-agency/expo-unlimited-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AnyAction, configureStore, Reducer } from '@reduxjs/toolkit'
import contextsMigration from '@utils/migrations/contexts/migration'
import instancesMigration from '@utils/migrations/instances/migration'
import contextsSlice, { ContextsState } from '@utils/slices/contextsSlice'
import instancesSlice, { InstancesState } from '@utils/slices/instancesSlice'
import settingsSlice, { SettingsState } from '@utils/slices/settingsSlice'
import versionSlice from '@utils/slices/versionSlice'
import { createMigrate, persistReducer, persistStore } from 'redux-persist'

const secureStorage = createSecureStore()

const prefix = 'tooot'

const contextsPersistConfig = {
  key: 'contexts',
  prefix,
  storage: AsyncStorage,
  version: 1,
  // @ts-ignore
  migrate: createMigrate(contextsMigration)
}

const instancesPersistConfig = {
  key: 'instances',
  prefix,
  storage: secureStorage,
  version: 7,
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
    contexts: persistReducer(contextsPersistConfig, contextsSlice) as Reducer<
      ContextsState,
      AnyAction
    >,
    instances: persistReducer(
      instancesPersistConfig,
      instancesSlice
    ) as Reducer<InstancesState, AnyAction>,
    settings: persistReducer(settingsPersistConfig, settingsSlice) as Reducer<
      SettingsState,
      AnyAction
    >,
    version: versionSlice
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
})

let persistor = persistStore(store)

export { store, persistor }
export type RootState = ReturnType<typeof store.getState>

import createSecureStore from '@neverdull-agency/expo-unlimited-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AnyAction, configureStore, Reducer } from '@reduxjs/toolkit'
import contextsMigration, { ContextsLatest } from '@utils/migrations/contexts/migration'
import instancesMigration from '@utils/migrations/instances/migration'
import settingsMigration, { SettingsLatest } from '@utils/migrations/settings/migration'
import appSlice, { AppState } from '@utils/slices/appSlice'
import contextsSlice from '@utils/slices/contextsSlice'
import instancesSlice, { InstancesState } from '@utils/slices/instancesSlice'
import settingsSlice from '@utils/slices/settingsSlice'
import { Platform } from 'react-native'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import {
  createMigrate,
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE
} from 'redux-persist'

const secureStorage = createSecureStore()

const prefix = 'tooot'

const appPersistConfig = {
  key: 'app',
  prefix,
  storage: AsyncStorage,
  version: 0
}

const contextsPersistConfig = {
  key: 'contexts',
  prefix,
  storage: AsyncStorage,
  version: 3,
  // @ts-ignore
  migrate: createMigrate(contextsMigration)
}

const instancesPersistConfig = {
  key: 'instances',
  prefix,
  storage: Platform.OS === 'ios' ? secureStorage : AsyncStorage,
  version: 11,
  // @ts-ignore
  migrate: createMigrate(instancesMigration)
}

const settingsPersistConfig = {
  key: 'settings',
  prefix,
  storage: AsyncStorage,
  version: 3,
  // @ts-ignore
  migrate: createMigrate(settingsMigration)
}

const store = configureStore({
  reducer: {
    app: persistReducer(appPersistConfig, appSlice) as Reducer<AppState, AnyAction>,
    contexts: persistReducer(contextsPersistConfig, contextsSlice) as Reducer<
      ContextsLatest,
      AnyAction
    >,
    instances: persistReducer(instancesPersistConfig, instancesSlice) as Reducer<
      InstancesState,
      AnyAction
    >,
    settings: persistReducer(settingsPersistConfig, settingsSlice) as Reducer<
      SettingsLatest,
      AnyAction
    >
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

let persistor = persistStore(store)

export { store, persistor }
export type RootState = ReturnType<typeof store.getState>

type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

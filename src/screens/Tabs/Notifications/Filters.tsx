import { HeaderLeft, HeaderRight } from '@components/Header'
import { MenuContainer, MenuRow } from '@components/Menu'
import {
  checkPermission,
  PERMISSION_MANAGE_REPORTS,
  PERMISSION_MANAGE_USERS
} from '@helpers/permissions'
import { useAppDispatch } from '@root/store'
import { useQueryClient } from '@tanstack/react-query'
import { TabNotificationsStackScreenProps } from '@utils/navigation/navigators'
import { useProfileQuery } from '@utils/queryHooks/profile'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import {
  checkInstanceFeature,
  getInstanceNotificationsFilter,
  updateInstanceNotificationsFilter
} from '@utils/slices/instancesSlice'
import { isEqual } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'

export const NOTIFICATIONS_FILTERS_DEFAULT: [
  'follow',
  'follow_request',
  'favourite',
  'reblog',
  'mention',
  'poll',
  'status',
  'update'
] = ['follow', 'follow_request', 'favourite', 'reblog', 'mention', 'poll', 'status', 'update']

export const NOTIFICATIONS_FILTERS_ADMIN: {
  type: 'admin.sign_up' | 'admin.report'
  permission: number
}[] = [
  { type: 'admin.sign_up', permission: PERMISSION_MANAGE_USERS },
  { type: 'admin.report', permission: PERMISSION_MANAGE_REPORTS }
]

const TabNotificationsFilters: React.FC<
  TabNotificationsStackScreenProps<'Tab-Notifications-Filters'>
> = ({ navigation }) => {
  const { t } = useTranslation('screenTabs')

  const hasTypeStatus = useSelector(checkInstanceFeature('notification_type_status'))
  const hasTypeUpdate = useSelector(checkInstanceFeature('notification_type_update'))

  const dispatch = useAppDispatch()

  const instanceNotificationsFilter = useSelector(getInstanceNotificationsFilter)
  const [filters, setFilters] = useState(instanceNotificationsFilter)

  const queryClient = useQueryClient()
  useEffect(() => {
    const changed = !isEqual(instanceNotificationsFilter, filters)
    navigation.setOptions({
      title: t('notifications.filters.title'),
      headerLeft: () => (
        <HeaderLeft
          content='ChevronDown'
          onPress={() => {
            if (changed) {
              Alert.alert(t('common:discard.title'), t('common:discard.message'), [
                {
                  text: t('common:buttons.discard'),
                  style: 'destructive',
                  onPress: () => navigation.goBack()
                },
                {
                  text: t('common:buttons.cancel'),
                  style: 'default'
                }
              ])
            } else {
              navigation.goBack()
            }
          }}
        />
      ),
      headerRight: () => (
        <HeaderRight
          type='text'
          content={t('common:buttons.apply')}
          onPress={() => {
            if (changed) {
              dispatch(updateInstanceNotificationsFilter(filters))
              const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Notifications' }]
              queryClient.invalidateQueries({ queryKey })
            }
            navigation.goBack()
          }}
        />
      )
    })
  }, [filters])

  const profileQuery = useProfileQuery()

  return (
    <ScrollView style={{ flex: 1 }}>
      <MenuContainer>
        {NOTIFICATIONS_FILTERS_DEFAULT.filter(type => {
          switch (type) {
            case 'status':
              return hasTypeStatus
            case 'update':
              return hasTypeUpdate
            default:
              return true
          }
        }).map((type, index) => (
          <MenuRow
            key={index}
            title={t(`notifications.filters.options.${type}`)}
            switchValue={filters[type]}
            switchOnValueChange={() => setFilters({ ...filters, [type]: !filters[type] })}
          />
        ))}
        {NOTIFICATIONS_FILTERS_ADMIN.filter(({ permission }) =>
          checkPermission(permission, profileQuery.data?.role?.permissions)
        ).map(({ type }) => (
          <MenuRow
            key={type}
            title={t(`notifications.filters.options.${type}`)}
            switchValue={filters[type]}
            switchOnValueChange={() => setFilters({ ...filters, [type]: !filters[type] })}
          />
        ))}
      </MenuContainer>
    </ScrollView>
  )
}

export default TabNotificationsFilters

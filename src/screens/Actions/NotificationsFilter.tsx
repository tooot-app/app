import Button from '@components/Button'
import MenuContainer from '@components/Menu/Container'
import MenuHeader from '@components/Menu/Header'
import MenuRow from '@components/Menu/Row'
import { useNavigation } from '@react-navigation/native'
import {
  getInstanceNotificationsFilter,
  updateInstanceNotificationsFilter
} from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import React, { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useQueryClient } from 'react-query'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { useAppDispatch } from '@root/store'

const ActionsNotificationsFilter: React.FC = () => {
  const navigation = useNavigation()
  const { t } = useTranslation('screenActions')

  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Notifications' }]
  const queryClient = useQueryClient()

  const dispatch = useAppDispatch()
  const instanceNotificationsFilter = useSelector(
    getInstanceNotificationsFilter
  )

  if (!instanceNotificationsFilter) {
    navigation.goBack()
    return null
  }

  const options = useMemo(() => {
    return (
      instanceNotificationsFilter &&
      (
        [
          'follow',
          'favourite',
          'reblog',
          'mention',
          'poll',
          'follow_request'
        ] as [
          'follow',
          'favourite',
          'reblog',
          'mention',
          'poll',
          'follow_request'
        ]
      ).map(type => (
        <MenuRow
          key={type}
          title={t(`content.notificationsFilter.content.${type}`)}
          switchValue={instanceNotificationsFilter[type]}
          switchOnValueChange={() =>
            dispatch(
              updateInstanceNotificationsFilter({
                ...instanceNotificationsFilter,
                [type]: !instanceNotificationsFilter[type]
              })
            )
          }
        />
      ))
    )
  }, [instanceNotificationsFilter])

  return (
    <>
      <MenuContainer>
        <MenuHeader heading={t(`content.notificationsFilter.heading`)} />
        {options}
      </MenuContainer>
      <Button
        type='text'
        content={t('content.button.apply')}
        onPress={() => {
          queryClient.resetQueries(queryKey)
        }}
        style={styles.button}
      />
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2
  }
})

export default ActionsNotificationsFilter

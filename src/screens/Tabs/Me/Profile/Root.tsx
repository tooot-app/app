import { MenuContainer, MenuRow } from '@components/Menu'
import { displayMessage } from '@components/Message'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { StackScreenProps } from '@react-navigation/stack'
import { useProfileMutation, useProfileQuery } from '@utils/queryHooks/profile'
import { updateAccountPreferences } from '@utils/slices/instances/updateAccountPreferences'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { RefObject, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import FlashMessage from 'react-native-flash-message'
import { ScrollView } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import ProfileAvatarHeader from './Root/AvatarHeader'

const TabMeProfileRoot: React.FC<StackScreenProps<
  Nav.TabMeProfileStackParamList,
  'Tab-Me-Profile-Root'
> & { messageRef: RefObject<FlashMessage> }> = ({ messageRef, navigation }) => {
  const { mode } = useTheme()
  const { t } = useTranslation('screenTabs')

  const { showActionSheetWithOptions } = useActionSheet()

  const { data, isLoading } = useProfileQuery({})
  const { mutateAsync } = useProfileMutation()
  const dispatch = useDispatch()

  const onPressVisibility = useCallback(() => {
    showActionSheetWithOptions(
      {
        title: t('me.profile.root.visibility.title'),
        options: [
          t('me.profile.root.visibility.options.public'),
          t('me.profile.root.visibility.options.unlisted'),
          t('me.profile.root.visibility.options.private'),
          t('me.profile.root.visibility.options.cancel')
        ],
        cancelButtonIndex: 3
      },
      async buttonIndex => {
        switch (buttonIndex) {
          case 0:
            mutateAsync({ type: 'source[privacy]', data: 'public' })
              .then(() => dispatch(updateAccountPreferences()))
              .catch(err =>
                displayMessage({
                  ref: messageRef,
                  message: t('me.profile.feedback.failed', {
                    type: t('me.profile.root.visibility.title')
                  }),
                  ...(err && { description: err }),
                  mode,
                  type: 'error'
                })
              )
            break
          case 1:
            mutateAsync({ type: 'source[privacy]', data: 'unlisted' })
              .then(() => dispatch(updateAccountPreferences()))
              .catch(err =>
                displayMessage({
                  ref: messageRef,
                  message: t('me.profile.feedback.failed', {
                    type: t('me.profile.root.visibility.title')
                  }),
                  ...(err && { description: err }),
                  mode,
                  type: 'error'
                })
              )
            break
          case 2:
            mutateAsync({ type: 'source[privacy]', data: 'private' })
              .then(() => dispatch(updateAccountPreferences()))
              .catch(err =>
                displayMessage({
                  ref: messageRef,
                  message: t('me.profile.feedback.failed', {
                    type: t('me.profile.root.visibility.title')
                  }),
                  ...(err && { description: err }),
                  mode,
                  type: 'error'
                })
              )
            break
        }
      }
    )
  }, [])

  const onPressSensitive = useCallback(() => {
    if (data?.source.sensitive === undefined) {
      mutateAsync({ type: 'source[sensitive]', data: true })
        .then(() => dispatch(updateAccountPreferences()))
        .catch(err =>
          displayMessage({
            ref: messageRef,
            message: t('me.profile.feedback.failed', {
              type: t('me.profile.root.sensitive.title')
            }),
            ...(err && { description: err }),
            mode,
            type: 'error'
          })
        )
    } else {
      mutateAsync({
        type: 'source[sensitive]',
        data: !data.source.sensitive
      })
        .then(() => dispatch(updateAccountPreferences()))
        .catch(err =>
          displayMessage({
            ref: messageRef,
            message: t('me.profile.feedback.failed', {
              type: t('me.profile.root.sensitive.title')
            }),
            ...(err && { description: err }),
            mode,
            type: 'error'
          })
        )
    }
  }, [data?.source.sensitive])

  const onPressLock = useCallback(() => {
    if (data?.locked === undefined) {
      mutateAsync({ type: 'locked', data: true }).catch(err =>
        displayMessage({
          ref: messageRef,
          message: t('me.profile.feedback.failed', {
            type: t('me.profile.root.lock.title')
          }),
          ...(err && { description: err }),
          mode,
          type: 'error'
        })
      )
    } else {
      mutateAsync({ type: 'locked', data: !data.locked }).catch(err =>
        displayMessage({
          ref: messageRef,
          message: t('me.profile.feedback.failed', {
            type: t('me.profile.root.lock.title')
          }),
          ...(err && { description: err }),
          mode,
          type: 'error'
        })
      )
    }
  }, [data?.locked])

  const onPressBot = useCallback(() => {
    if (data?.bot === undefined) {
      mutateAsync({ type: 'bot', data: true }).catch(err =>
        displayMessage({
          ref: messageRef,
          message: t('me.profile.feedback.failed', {
            type: t('me.profile.root.bot.title')
          }),
          ...(err && { description: err }),
          mode,
          type: 'error'
        })
      )
    } else {
      mutateAsync({ type: 'bot', data: !data?.bot }).catch(err =>
        displayMessage({
          ref: messageRef,
          message: t('me.profile.feedback.failed', {
            type: t('me.profile.root.bot.title')
          }),
          ...(err && { description: err }),
          mode,
          type: 'error'
        })
      )
    }
  }, [data?.bot])

  return (
    <ScrollView>
      <MenuContainer>
        <MenuRow
          title={t('me.profile.root.name.title')}
          content={data?.display_name}
          loading={isLoading}
          iconBack='ChevronRight'
          onPress={() => {
            data &&
              navigation.navigate('Tab-Me-Profile-Name', {
                display_name: data.display_name
              })
          }}
        />
        <ProfileAvatarHeader type='avatar' messageRef={messageRef} />
        <ProfileAvatarHeader type='header' messageRef={messageRef} />
        <MenuRow
          title={t('me.profile.root.note.title')}
          content={data?.source.note}
          loading={isLoading}
          iconBack='ChevronRight'
          onPress={() => {
            data &&
              navigation.navigate('Tab-Me-Profile-Note', {
                note: data.source?.note
              })
          }}
        />
        <MenuRow
          title={t('me.profile.root.fields.title')}
          content={
            data?.source.fields && data.source.fields.length
              ? t('me.profile.root.fields.total', {
                  count: data.source.fields.length
                })
              : undefined
          }
          loading={isLoading}
          iconBack='ChevronRight'
          onPress={() => {
            navigation.navigate('Tab-Me-Profile-Fields', {
              fields: data?.source.fields
            })
          }}
        />
      </MenuContainer>
      <MenuContainer>
        <MenuRow
          title={t('me.profile.root.visibility.title')}
          content={
            data?.source.privacy
              ? t(`me.profile.root.visibility.options.${data?.source.privacy}`)
              : undefined
          }
          loading={isLoading}
          iconBack='ChevronRight'
          onPress={onPressVisibility}
        />
        <MenuRow
          title={t('me.profile.root.sensitive.title')}
          switchValue={data?.source.sensitive}
          switchOnValueChange={onPressSensitive}
          loading={isLoading}
        />
      </MenuContainer>
      <MenuContainer>
        <MenuRow
          title={t('me.profile.root.lock.title')}
          description={t('me.profile.root.lock.description')}
          switchValue={data?.locked}
          switchOnValueChange={onPressLock}
          loading={isLoading}
        />
        <MenuRow
          title={t('me.profile.root.bot.title')}
          description={t('me.profile.root.bot.description')}
          switchValue={data?.bot}
          switchOnValueChange={onPressBot}
          loading={isLoading}
        />
      </MenuContainer>
    </ScrollView>
  )
}

export default TabMeProfileRoot

import analytics from '@components/analytics'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { TabMeProfileStackScreenProps } from '@utils/navigation/navigators'
import { useProfileMutation, useProfileQuery } from '@utils/queryHooks/profile'
import { updateAccountPreferences } from '@utils/slices/instances/updateAccountPreferences'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { RefObject, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import FlashMessage from 'react-native-flash-message'
import { ScrollView } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import ProfileAvatarHeader from './Root/AvatarHeader'

const TabMeProfileRoot: React.FC<TabMeProfileStackScreenProps<
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
          case 1:
          case 2:
            const indexVisibilityMapping = [
              'public',
              'unlisted',
              'private'
            ] as ['public', 'unlisted', 'private']
            if (data?.source.privacy !== indexVisibilityMapping[buttonIndex]) {
              analytics('me_profile_visibility', {
                current: t(
                  `me.profile.root.visibility.options.${data?.source.privacy}`
                ),
                new: indexVisibilityMapping[buttonIndex]
              })
              mutateAsync({
                mode,
                messageRef,
                message: {
                  text: 'me.profile.root.visibility.title',
                  succeed: false,
                  failed: true
                },
                type: 'source[privacy]',
                data: indexVisibilityMapping[buttonIndex]
              }).then(() => dispatch(updateAccountPreferences()))
            }
            break
        }
      }
    )
  }, [data?.source.privacy])

  const onPressSensitive = useCallback(() => {
    analytics('me_profile_sensitive', {
      current: data?.source.sensitive,
      new: data?.source.sensitive === undefined ? true : !data.source.sensitive
    })
    mutateAsync({
      mode,
      messageRef,
      message: {
        text: 'me.profile.root.sensitive.title',
        succeed: false,
        failed: true
      },
      type: 'source[sensitive]',
      data: data?.source.sensitive === undefined ? true : !data.source.sensitive
    }).then(() => dispatch(updateAccountPreferences()))
  }, [data?.source.sensitive])

  const onPressLock = useCallback(() => {
    analytics('me_profile_lock', {
      current: data?.locked,
      new: data?.locked === undefined ? true : !data.locked
    })
    mutateAsync({
      mode,
      messageRef,
      message: {
        text: 'me.profile.root.lock.title',
        succeed: false,
        failed: true
      },
      type: 'locked',
      data: data?.locked === undefined ? true : !data.locked
    })
  }, [data?.locked])

  const onPressBot = useCallback(() => {
    analytics('me_profile_bot', {
      current: data?.bot,
      new: data?.bot === undefined ? true : !data.bot
    })
    mutateAsync({
      mode,
      messageRef,
      message: {
        text: 'me.profile.root.bot.title',
        succeed: false,
        failed: true
      },
      type: 'bot',
      data: data?.bot === undefined ? true : !data.bot
    })
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

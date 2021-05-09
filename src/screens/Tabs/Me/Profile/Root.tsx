import { MenuContainer, MenuRow } from '@components/Menu'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { StackScreenProps } from '@react-navigation/stack'
import { useProfileMutation, useProfileQuery } from '@utils/queryHooks/profile'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native-gesture-handler'

const ScreenMeProfileRoot: React.FC<StackScreenProps<
  Nav.TabMeProfileStackParamList,
  'Tab-Me-Profile-Root'
>> = ({ navigation }) => {
  const { t } = useTranslation('screenTabs')

  const { showActionSheetWithOptions } = useActionSheet()

  const { data, isLoading } = useProfileQuery({})
  const { mutate } = useProfileMutation()

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
            mutate({ type: 'source[privacy]', data: 'public' })
            break
          case 1:
            mutate({ type: 'source[privacy]', data: 'unlisted' })
            break
          case 2:
            mutate({ type: 'source[privacy]', data: 'private' })
            break
        }
      }
    )
  }, [])

  const onPressSensitive = useCallback(() => {
    if (data?.source.sensitive === undefined) {
      mutate({ type: 'source[sensitive]', data: true })
    } else {
      mutate({ type: 'source[sensitive]', data: !data.source.sensitive })
    }
  }, [data?.source.sensitive])

  const onPressLock = useCallback(() => {
    if (data?.locked === undefined) {
      mutate({ type: 'locked', data: true })
    } else {
      mutate({ type: 'locked', data: !data.locked })
    }
  }, [data?.locked])

  const onPressBot = useCallback(() => {
    if (data?.bot === undefined) {
      mutate({ type: 'bot', data: true })
    } else {
      mutate({ type: 'bot', data: !data?.bot })
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
        <MenuRow
          title={t('me.profile.root.avatar.title')}
          description={t('me.profile.root.avatar.description')}
          // content={
          //   <GracefullyImage
          //     style={{ flex: 1 }}
          //     uri={{
          //       original: data?.avatar_static
          //     }}
          //   />
          // }
          // loading={isLoading}
          // iconBack='ChevronRight'
        />
        <MenuRow
          title={t('me.profile.root.banner.title')}
          description={t('me.profile.root.banner.description')}
          // content={
          //   <GracefullyImage
          //     style={{ flex: 1 }}
          //     uri={{
          //       original: data?.header_static
          //     }}
          //   />
          // }
          // loading={isLoading}
          // iconBack='ChevronRight'
        />
        <MenuRow
          title={t('me.profile.root.note.title')}
          content={data?.source.note}
          loading={isLoading}
          iconBack='ChevronRight'
          onPress={() => {
            navigation.navigate('Tab-Me-Profile-Note', {
              note: data?.source?.note || ''
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

export default ScreenMeProfileRoot

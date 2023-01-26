import { MenuContainer, MenuRow } from '@components/Menu'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { androidActionSheetStyles } from '@utils/helpers/androidActionSheetStyles'
import browserPackage from '@utils/helpers/browserPackage'
import { featureCheck } from '@utils/helpers/featureCheck'
import { TabMePreferencesStackScreenProps } from '@utils/navigation/navigators'
import { useFiltersQuery } from '@utils/queryHooks/filters'
import { usePreferencesQuery } from '@utils/queryHooks/preferences'
import { useProfileMutation } from '@utils/queryHooks/profile'
import { getAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as WebBrowser from 'expo-web-browser'
import React, { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import FlashMessage from 'react-native-flash-message'
import { ScrollView } from 'react-native-gesture-handler'

const TabMePreferencesRoot: React.FC<
  TabMePreferencesStackScreenProps<'Tab-Me-Preferences-Root'> & {
    messageRef: RefObject<FlashMessage>
  }
> = ({ navigation, messageRef }) => {
  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])

  const { showActionSheetWithOptions } = useActionSheet()

  const { mutateAsync } = useProfileMutation()

  const { data, isFetching, refetch } = usePreferencesQuery()

  const { data: filters, isFetching: filtersIsFetching } = useFiltersQuery<'v2'>({ version: 'v2' })

  return (
    <ScrollView>
      <MenuContainer>
        {data?.['posting:default:visibility'] !== 'direct' ? (
          <MenuRow
            title={t('screenTabs:me.preferences.visibility.title')}
            content={
              data?.['posting:default:visibility']
                ? t(
                    `screenTabs:me.preferences.visibility.options.${data['posting:default:visibility']}`
                  )
                : undefined
            }
            loading={isFetching}
            iconBack='chevron-right'
            onPress={() =>
              showActionSheetWithOptions(
                {
                  title: t('screenTabs:me.preferences.visibility.title'),
                  options: [
                    t('screenTabs:me.preferences.visibility.options.public'),
                    t('screenTabs:me.preferences.visibility.options.unlisted'),
                    t('screenTabs:me.preferences.visibility.options.private'),
                    t('common:buttons.cancel')
                  ],
                  cancelButtonIndex: 3,
                  ...androidActionSheetStyles(colors)
                },
                async buttonIndex => {
                  switch (buttonIndex) {
                    case 0:
                    case 1:
                    case 2:
                      const indexVisibilityMapping = ['public', 'unlisted', 'private'] as [
                        'public',
                        'unlisted',
                        'private'
                      ]
                      if (
                        data?.['posting:default:visibility'] &&
                        data['posting:default:visibility'] !== indexVisibilityMapping[buttonIndex]
                      ) {
                        mutateAsync({
                          messageRef,
                          message: {
                            text: 'me.profile.root.visibility.title',
                            succeed: false,
                            failed: true
                          },
                          type: 'source[privacy]',
                          data: indexVisibilityMapping[buttonIndex]
                        }).then(() => refetch())
                      }
                      break
                  }
                }
              )
            }
          />
        ) : null}
        <MenuRow
          title={t('screenTabs:me.preferences.sensitive.title')}
          switchValue={data?.['posting:default:sensitive']}
          switchOnValueChange={() =>
            mutateAsync({
              messageRef,
              message: {
                text: 'me.profile.root.sensitive.title',
                succeed: false,
                failed: true
              },
              type: 'source[sensitive]',
              data:
                data?.['posting:default:sensitive'] === undefined
                  ? true
                  : !data['posting:default:sensitive']
            }).then(() => refetch())
          }
          loading={isFetching}
        />
      </MenuContainer>
      <MenuContainer style={{ marginTop: StyleConstants.Spacing.L }}>
        <MenuRow
          iconBack='external-link'
          title={t('screenTabs:me.preferences.web_only.title')}
          description={t('screenTabs:me.preferences.web_only.description')}
          onPress={async () =>
            WebBrowser.openAuthSessionAsync(
              `https://${getAccountStorage.string('auth.domain')}/settings/preferences`,
              'tooot://tooot',
              {
                ...(await browserPackage()),
                dismissButtonStyle: 'done',
                readerMode: false
              }
            ).then(() => refetch())
          }
        />
        <MenuRow
          title={t('screenTabs:me.preferences.media.title')}
          content={
            data?.['reading:expand:media']
              ? t(`screenTabs:me.preferences.media.options.${data['reading:expand:media']}`)
              : undefined
          }
          loading={isFetching}
        />
        <MenuRow
          title={t('screenTabs:me.preferences.spoilers.title')}
          switchValue={data?.['reading:expand:spoilers'] || false}
          switchDisabled={true}
          loading={isFetching}
        />
        {data?.['reading:autoplay:gifs'] !== undefined ? (
          <MenuRow
            title={t('screenTabs:me.preferences.autoplay_gifs.title')}
            switchValue={data['reading:autoplay:gifs'] || false}
            switchDisabled={true}
            loading={isFetching}
          />
        ) : null}
      </MenuContainer>
      {featureCheck('filter_server_side') ? (
        <MenuContainer>
          <MenuRow
            title={t('screenTabs:me.preferences.filters.title')}
            content={t('screenTabs:me.preferences.filters.content', {
              count: filters?.filter(filter =>
                filter.expires_at ? new Date(filter.expires_at) > new Date() : true
              ).length
            })}
            loading={filtersIsFetching}
            iconBack='chevron-right'
            onPress={() => navigation.navigate('Tab-Me-Preferences-Filters')}
          />
        </MenuContainer>
      ) : null}
    </ScrollView>
  )
}

export default TabMePreferencesRoot

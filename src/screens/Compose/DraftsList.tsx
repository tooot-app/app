import apiInstance from '@api/instance'
import { HeaderLeft } from '@components/Header'
import Icon from '@components/Icon'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import HeaderSharedCreated from '@components/Timeline/Shared/HeaderShared/Created'
import { useAppDispatch } from '@root/store'
import { ScreenComposeStackScreenProps } from '@utils/navigation/navigators'
import { getInstanceDrafts, removeInstanceDraft } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Modal, Platform, Pressable, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { PanGestureHandler } from 'react-native-gesture-handler'
import { SwipeListView } from 'react-native-swipe-list-view'
import { useSelector } from 'react-redux'
import ComposeContext from './utils/createContext'
import { formatText } from './utils/processText'
import { ComposeStateDraft, ExtendedAttachment } from './utils/types'

const ComposeDraftsList: React.FC<ScreenComposeStackScreenProps<'Screen-Compose-DraftsList'>> = ({
  navigation,
  route: {
    params: { timestamp }
  }
}) => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenCompose')

  useEffect(() => {
    navigation.setOptions({
      title: t('content.draftsList.header.title'),
      headerLeft: () => (
        <HeaderLeft type='icon' content='ChevronDown' onPress={() => navigation.goBack()} />
      )
    })
  }, [])

  const { composeDispatch } = useContext(ComposeContext)
  const instanceDrafts = useSelector(getInstanceDrafts)?.filter(
    draft => draft.timestamp !== timestamp
  )
  const [checkingAttachments, setCheckingAttachments] = useState(false)
  const dispatch = useAppDispatch()

  const actionWidth = StyleConstants.Font.Size.L + StyleConstants.Spacing.Global.PagePadding * 4

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
          padding: StyleConstants.Spacing.S,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: StyleConstants.Spacing.S
        }}
      >
        <Icon
          name='AlertTriangle'
          color={colors.secondary}
          size={StyleConstants.Font.Size.M}
          style={{ marginRight: StyleConstants.Spacing.S }}
        />
        <CustomText fontStyle='S' style={{ flexShrink: 1, color: colors.secondary }}>
          {t('content.draftsList.warning')}
        </CustomText>
      </View>
      <PanGestureHandler enabled={Platform.OS === 'ios'}>
        <SwipeListView
          data={instanceDrafts}
          renderItem={({ item }: { item: ComposeStateDraft }) => {
            return (
              <Pressable
                accessibilityHint={t('content.draftsList.content.accessibilityHint')}
                style={{
                  flex: 1,
                  padding: StyleConstants.Spacing.Global.PagePadding,
                  backgroundColor: colors.backgroundDefault
                }}
                onPress={async () => {
                  setCheckingAttachments(true)
                  let tempDraft = item
                  let tempUploads: ExtendedAttachment[] = []
                  if (item.attachments && item.attachments.uploads.length) {
                    for (const attachment of item.attachments.uploads) {
                      await apiInstance<Mastodon.Attachment>({
                        method: 'get',
                        url: `media/${attachment.remote?.id}`
                      })
                        .then(res => {
                          if (res.body.id === attachment.remote?.id) {
                            tempUploads.push(attachment)
                          }
                        })
                        .catch(() => {})
                    }
                    tempDraft = {
                      ...tempDraft,
                      attachments: { ...item.attachments, uploads: tempUploads }
                    }
                  }

                  tempDraft.spoiler?.length &&
                    formatText({ textInput: 'text', composeDispatch, content: tempDraft.spoiler })
                  tempDraft.text?.length &&
                    formatText({ textInput: 'text', composeDispatch, content: tempDraft.text })
                  composeDispatch({
                    type: 'loadDraft',
                    payload: tempDraft
                  })
                  dispatch(removeInstanceDraft(item.timestamp))
                  navigation.goBack()
                }}
              >
                <View style={{ flex: 1 }}>
                  <HeaderSharedCreated created_at={item.timestamp} />
                  <CustomText
                    fontStyle='M'
                    numberOfLines={2}
                    style={{
                      marginTop: StyleConstants.Spacing.XS,
                      color: colors.primaryDefault
                    }}
                  >
                    {item.text || item.spoiler || t('content.draftsList.content.textEmpty')}
                  </CustomText>
                  {item.attachments?.uploads.length ? (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        marginTop: StyleConstants.Spacing.S
                      }}
                    >
                      {item.attachments.uploads.map((attachment, index) => (
                        <FastImage
                          key={index}
                          style={{
                            width:
                              (Dimensions.get('window').width -
                                StyleConstants.Spacing.Global.PagePadding * 2 -
                                StyleConstants.Spacing.S * 3) /
                              4,
                            height:
                              (Dimensions.get('window').width -
                                StyleConstants.Spacing.Global.PagePadding * 2 -
                                StyleConstants.Spacing.S * 3) /
                              4,
                            marginLeft: index !== 0 ? StyleConstants.Spacing.S : 0
                          }}
                          source={{
                            uri: attachment.local?.thumbnail || attachment.remote?.preview_url
                          }}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              </Pressable>
            )
          }}
          renderHiddenItem={({ item }) => (
            <Pressable
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                backgroundColor: colors.red
              }}
              onPress={() => dispatch(removeInstanceDraft(item.timestamp))}
              children={
                <View
                  style={{
                    flexBasis:
                      StyleConstants.Font.Size.L + StyleConstants.Spacing.Global.PagePadding * 4,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  children={
                    <Icon
                      name='Trash'
                      size={StyleConstants.Font.Size.L}
                      color={colors.primaryOverlay}
                    />
                  }
                />
              }
            />
          )}
          disableRightSwipe={true}
          rightOpenValue={-actionWidth}
          previewOpenValue={-actionWidth / 2}
          ItemSeparatorComponent={ComponentSeparator}
          keyExtractor={item => item.timestamp?.toString()}
        />
      </PanGestureHandler>
      <Modal
        transparent
        animationType='fade'
        visible={checkingAttachments}
        children={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.backgroundOverlayInvert
            }}
            children={
              <CustomText
                fontStyle='M'
                children={t('content.draftsList.checkAttachment')}
                style={{ color: colors.primaryOverlay }}
              />
            }
          />
        }
      />
    </>
  )
}

export default ComposeDraftsList

import apiInstance from '@api/instance'
import Icon from '@components/Icon'
import ComponentSeparator from '@components/Separator'
import HeaderSharedCreated from '@components/Timeline/Shared/HeaderShared/Created'
import { useNavigation } from '@react-navigation/native'
import {
  getInstanceDrafts,
  removeInstanceDraft
} from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { PanGestureHandler } from 'react-native-gesture-handler'
import { SwipeListView } from 'react-native-swipe-list-view'
import { useDispatch, useSelector } from 'react-redux'
import formatText from '../formatText'
import ComposeContext from '../utils/createContext'
import { ComposeStateDraft, ExtendedAttachment } from '../utils/types'

export interface Props {
  timestamp: number
}

const ComposeDraftsListRoot: React.FC<Props> = ({ timestamp }) => {
  const { composeDispatch } = useContext(ComposeContext)
  const { t } = useTranslation('sharedCompose')
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { mode, theme } = useTheme()
  const instanceDrafts = useSelector(getInstanceDrafts)?.filter(
    draft => draft.timestamp !== timestamp
  )

  const actionWidth =
    StyleConstants.Font.Size.L + StyleConstants.Spacing.Global.PagePadding * 4

  const [checkingAttachments, setCheckingAttachments] = useState(false)

  const removeDraft = useCallback(ts => {
    dispatch(removeInstanceDraft(ts))
  }, [])

  const renderItem = useCallback(
    ({ item }: { item: ComposeStateDraft }) => {
      return (
        <Pressable
          style={[styles.draft, { backgroundColor: theme.backgroundDefault }]}
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
              formatText({
                textInput: 'text',
                composeDispatch,
                content: tempDraft.spoiler
              })
            tempDraft.text?.length &&
              formatText({
                textInput: 'text',
                composeDispatch,
                content: tempDraft.text
              })
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
            <Text
              numberOfLines={2}
              style={[styles.text, { color: theme.primaryDefault }]}
            >
              {item.text ||
                item.spoiler ||
                t('content.draftsList.content.textEmpty')}
            </Text>
            {item.attachments?.uploads.length ? (
              <View style={styles.attachments}>
                {item.attachments.uploads.map((attachment, index) => (
                  <Image
                    key={index}
                    style={[
                      styles.attachment,
                      { marginLeft: index !== 0 ? StyleConstants.Spacing.S : 0 }
                    ]}
                    source={{
                      uri:
                        attachment.local?.local_thumbnail ||
                        attachment.remote?.preview_url
                    }}
                  />
                ))}
              </View>
            ) : null}
          </View>
        </Pressable>
      )
    },
    [mode]
  )
  const renderHiddenItem = useCallback(
    ({ item }) => (
      <View
        style={[styles.hiddenBase, { backgroundColor: theme.red }]}
        children={
          <Pressable
            style={styles.action}
            onPress={() => removeDraft(item.timestamp)}
            children={
              <Icon
                name='Trash'
                size={StyleConstants.Font.Size.L}
                color={theme.primaryOverlay}
              />
            }
          />
        }
      />
    ),
    [mode]
  )

  return (
    <>
      <PanGestureHandler enabled={Platform.OS === 'ios'}>
        <SwipeListView
          data={instanceDrafts}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          disableRightSwipe={true}
          rightOpenValue={-actionWidth}
          // previewRowKey={
          //   instanceDrafts?.length
          //     ? instanceDrafts[0].timestamp.toString()
          //     : undefined
          // }
          // previewDuration={350}
          previewOpenValue={-actionWidth / 2}
          ItemSeparatorComponent={ComponentSeparator}
          keyExtractor={item => item.timestamp.toString()}
        />
      </PanGestureHandler>
      <Modal
        transparent
        animationType='fade'
        visible={checkingAttachments}
        children={
          <View
            style={[styles.modal, { backgroundColor: theme.backgroundOverlayInvert }]}
            children={
              <Text
                children='检查附件在服务器的状态…'
                style={{
                  ...StyleConstants.FontStyle.M,
                  color: theme.primaryOverlay
                }}
              />
            }
          />
        }
      />
    </>
  )
}

const styles = StyleSheet.create({
  draft: {
    flex: 1,
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  text: {
    marginTop: StyleConstants.Spacing.XS,
    ...StyleConstants.FontStyle.M
  },
  attachments: {
    flex: 1,
    flexDirection: 'row',
    marginTop: StyleConstants.Spacing.S
  },
  attachment: {
    width:
      (Dimensions.get('screen').width -
        StyleConstants.Spacing.Global.PagePadding * 2 -
        StyleConstants.Spacing.S * 3) /
      4,
    height:
      (Dimensions.get('screen').width -
        StyleConstants.Spacing.Global.PagePadding * 2 -
        StyleConstants.Spacing.S * 3) /
      4
  },
  hiddenBase: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  action: {
    flexBasis:
      StyleConstants.Font.Size.L +
      StyleConstants.Spacing.Global.PagePadding * 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default ComposeDraftsListRoot

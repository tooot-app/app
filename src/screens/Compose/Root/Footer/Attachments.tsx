import Button from '@components/Button'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { Loading } from '@components/Loading'
import { MAX_MEDIA_ATTACHMENTS } from '@components/mediaSelector'
import CustomText from '@components/Text'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useNavigation } from '@react-navigation/native'
import { connectMedia } from '@utils/api/helpers/connect'
import { featureCheck } from '@utils/helpers/featureCheck'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import { Image } from 'expo-image'
import React, { RefObject, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import ComposeContext from '../../utils/createContext'
import { ExtendedAttachment } from '../../utils/types'
import chooseAndUploadAttachment from './addAttachment'

export const DEFAULT_WIDTH = 150

export interface Props {
  accessibleRefAttachments: RefObject<View>
}

const ComposeAttachments: React.FC<Props> = ({ accessibleRefAttachments }) => {
  const { showActionSheetWithOptions } = useActionSheet()
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { t } = useTranslation('screenCompose')
  const { colors } = useTheme()
  const navigation = useNavigation<any>()

  const flatListRef = useRef<FlatList>(null)

  const sensitiveOnPress = () =>
    composeDispatch({
      type: 'attachments/sensitive',
      payload: { sensitive: !composeState.attachments.sensitive }
    })

  const renderAttachment = ({ item, index }: { item: ExtendedAttachment; index: number }) => {
    return (
      <View
        key={index}
        style={{
          marginLeft: StyleConstants.Spacing.Global.PagePadding,
          marginTop: StyleConstants.Spacing.Global.PagePadding,
          marginBottom: StyleConstants.Spacing.Global.PagePadding
        }}
      >
        <Image
          style={{
            width: DEFAULT_WIDTH,
            height: DEFAULT_WIDTH,
            borderRadius: StyleConstants.BorderRadius / 2
          }}
          source={
            item.local?.thumbnail
              ? { uri: item.local?.thumbnail }
              : connectMedia({ uri: item.remote?.preview_url })
          }
        />
        {item.remote?.meta?.original?.duration ? (
          <CustomText
            fontStyle='S'
            style={{
              position: 'absolute',
              bottom: StyleConstants.Spacing.S,
              left: StyleConstants.Spacing.S,
              paddingLeft: StyleConstants.Spacing.S,
              paddingRight: StyleConstants.Spacing.S,
              paddingTop: StyleConstants.Spacing.XS,
              paddingBottom: StyleConstants.Spacing.XS,
              color: colors.primaryOverlay,
              backgroundColor: colors.backgroundOverlayInvert
            }}
          >
            {item.remote.meta.original.duration}
          </CustomText>
        ) : null}
        {item.uploading ? (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.backgroundOverlayInvert
            }}
          >
            <Loading />
          </View>
        ) : (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              justifyContent: 'space-between',
              alignContent: 'flex-end',
              alignItems: 'flex-end',
              padding: StyleConstants.Spacing.S
            }}
          >
            <Button
              accessibilityLabel={t('content.root.footer.attachments.remove.accessibilityLabel', {
                attachment: index + 1
              })}
              type='icon'
              content='x'
              size='L'
              round
              overlay
              onPress={() => {
                layoutAnimation()
                composeDispatch({
                  type: 'attachment/delete',
                  payload: item.remote!.id
                })
                haptics('Success')
              }}
            />
            {composeState.type !== 'edit' ||
            (composeState.type === 'edit' && featureCheck('edit_media_details')) ? (
              <Button
                accessibilityLabel={t('content.root.footer.attachments.edit.accessibilityLabel', {
                  attachment: index + 1
                })}
                overlay
                size='S'
                type='text'
                content={!!item.remote?.description?.length ? 'ALT ✓' : '+ ALT'}
                fontBold
                onPress={() => navigation.navigate('Screen-Compose-EditAttachment', { index })}
              />
            ) : null}
          </View>
        )}
      </View>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        marginRight: StyleConstants.Spacing.Global.PagePadding,
        marginTop: StyleConstants.Spacing.M
      }}
      ref={accessibleRefAttachments}
      accessible
    >
      <Pressable
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: StyleConstants.Spacing.Global.PagePadding
        }}
        onPress={sensitiveOnPress}
      >
        <Icon
          name={composeState.attachments.sensitive ? 'check-circle' : 'circle'}
          size={StyleConstants.Font.Size.L}
          color={colors.primaryDefault}
        />
        <CustomText
          fontStyle='M'
          style={{
            marginLeft: StyleConstants.Spacing.S,
            color: colors.primaryDefault
          }}
        >
          {t('content.root.footer.attachments.sensitive')}
        </CustomText>
      </Pressable>
      <FlatList
        horizontal
        ref={flatListRef}
        decelerationRate={0}
        pagingEnabled={false}
        snapToAlignment='center'
        renderItem={renderAttachment}
        snapToOffsets={new Array(composeState.attachments.uploads.length).fill(DEFAULT_WIDTH)}
        keyboardShouldPersistTaps='always'
        showsHorizontalScrollIndicator={false}
        data={composeState.attachments.uploads}
        keyExtractor={item => item.local?.uri || item.remote?.url || Math.random().toString()}
        ListFooterComponent={
          composeState.attachments.uploads.length < MAX_MEDIA_ATTACHMENTS() ? (
            <Pressable
              accessible
              accessibilityLabel={t('content.root.footer.attachments.upload.accessibilityLabel')}
              style={{
                width: DEFAULT_WIDTH,
                height: DEFAULT_WIDTH,
                marginLeft: StyleConstants.Spacing.Global.PagePadding,
                marginTop: StyleConstants.Spacing.Global.PagePadding,
                marginBottom: StyleConstants.Spacing.Global.PagePadding,
                backgroundColor: colors.disabled
              }}
              onPress={async () => {
                await chooseAndUploadAttachment({
                  composeDispatch,
                  showActionSheetWithOptions
                })
              }}
            >
              <Button
                type='icon'
                content='upload-cloud'
                size='L'
                onPress={async () => {
                  await chooseAndUploadAttachment({
                    composeDispatch,
                    showActionSheetWithOptions
                  })
                }}
                style={{
                  position: 'absolute',
                  top:
                    (DEFAULT_WIDTH - StyleConstants.Spacing.M * 2 - StyleConstants.Font.Size.M) / 2,
                  left:
                    (DEFAULT_WIDTH - StyleConstants.Spacing.M * 2 - StyleConstants.Font.Size.M) / 2,
                  borderWidth: 0,
                  backgroundColor: ''
                }}
              />
            </Pressable>
          ) : null
        }
      />
    </View>
  )
}

export default ComposeAttachments

import analytics from '@components/analytics'
import Button from '@components/Button'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import CustomText from '@components/Text'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useNavigation } from '@react-navigation/native'
import { getInstanceConfigurationStatusMaxAttachments } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import React, {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import FastImage from 'react-native-fast-image'
import { useSelector } from 'react-redux'
import ComposeContext from '../../utils/createContext'
import { ExtendedAttachment } from '../../utils/types'
import chooseAndUploadAttachment from './addAttachment'

export interface Props {
  accessibleRefAttachments: RefObject<View>
}

const DEFAULT_HEIGHT = 200

const ComposeAttachments: React.FC<Props> = ({ accessibleRefAttachments }) => {
  const { showActionSheetWithOptions } = useActionSheet()
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { t } = useTranslation('screenCompose')
  const { colors } = useTheme()
  const navigation = useNavigation<any>()

  const maxAttachments = useSelector(
    getInstanceConfigurationStatusMaxAttachments,
    () => true
  )

  const flatListRef = useRef<FlatList>(null)

  const sensitiveOnPress = useCallback(() => {
    analytics('compose_attachment_sensitive_press', {
      current: composeState.attachments.sensitive
    })
    composeDispatch({
      type: 'attachments/sensitive',
      payload: { sensitive: !composeState.attachments.sensitive }
    })
  }, [composeState.attachments.sensitive])

  const calculateWidth = useCallback((item: ExtendedAttachment) => {
    if (item.local) {
      return (
        ((item.local.width || 100) / (item.local.height || 100)) *
        DEFAULT_HEIGHT
      )
    } else {
      if (item.remote) {
        if (item.remote.meta.original.aspect) {
          return item.remote.meta.original.aspect * DEFAULT_HEIGHT
        } else if (
          item.remote.meta.original.width &&
          item.remote.meta.original.height
        ) {
          return (
            (item.remote.meta.original.width /
              item.remote.meta.original.height) *
            DEFAULT_HEIGHT
          )
        } else {
          return DEFAULT_HEIGHT
        }
      } else {
        return DEFAULT_HEIGHT
      }
    }
  }, [])

  const snapToOffsets = useMemo(() => {
    const attachmentsOffsets = composeState.attachments.uploads.map(
      (_, index) => {
        let currentOffset = 0
        Array.from(Array(index).keys()).map(
          i =>
            (currentOffset =
              currentOffset +
              calculateWidth(composeState.attachments.uploads[i]) +
              StyleConstants.Spacing.Global.PagePadding)
        )
        return currentOffset
      }
    )
    return attachmentsOffsets.length < 4
      ? [
          ...attachmentsOffsets,
          attachmentsOffsets.reduce((a, b) => a + b, 0) +
            DEFAULT_HEIGHT +
            StyleConstants.Spacing.Global.PagePadding
        ]
      : attachmentsOffsets
  }, [composeState.attachments.uploads.length])
  let prevOffsets = useRef<number[]>()
  useEffect(() => {
    if (
      snapToOffsets.length >
      (prevOffsets.current ? prevOffsets.current.length : 0)
    ) {
      flatListRef.current?.scrollToOffset({
        offset:
          snapToOffsets[snapToOffsets.length - 2] +
          snapToOffsets[snapToOffsets.length - 1]
      })
    }
    prevOffsets.current = snapToOffsets
  }, [snapToOffsets, prevOffsets.current])

  const renderAttachment = useCallback(
    ({ item, index }: { item: ExtendedAttachment; index: number }) => {
      return (
        <View
          key={index}
          style={{
            height: DEFAULT_HEIGHT,
            marginLeft: StyleConstants.Spacing.Global.PagePadding,
            marginTop: StyleConstants.Spacing.Global.PagePadding,
            marginBottom: StyleConstants.Spacing.Global.PagePadding,
            width: calculateWidth(item)
          }}
        >
          <FastImage
            style={{ width: '100%', height: '100%' }}
            source={{
              uri: item.local?.thumbnail || item.remote?.preview_url
            }}
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
                color: colors.backgroundDefault,
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
              <Circle
                size={StyleConstants.Font.Size.L}
                color={colors.primaryOverlay}
              />
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
                accessibilityLabel={t(
                  'content.root.footer.attachments.remove.accessibilityLabel',
                  { attachment: index + 1 }
                )}
                type='icon'
                content='X'
                spacing='M'
                round
                overlay
                onPress={() => {
                  analytics('compose_attachment_delete')
                  layoutAnimation()
                  composeDispatch({
                    type: 'attachment/delete',
                    payload: item.remote!.id
                  })
                  haptics('Success')
                }}
              />
              <Button
                accessibilityLabel={t(
                  'content.root.footer.attachments.edit.accessibilityLabel',
                  { attachment: index + 1 }
                )}
                type='icon'
                content='Edit'
                spacing='M'
                round
                overlay
                onPress={() => {
                  analytics('compose_attachment_edit')
                  navigation.navigate('Screen-Compose-EditAttachment', {
                    index
                  })
                }}
              />
            </View>
          )}
        </View>
      )
    },
    []
  )

  const listFooter = useMemo(
    () => (
      <Pressable
        accessible
        accessibilityLabel={t(
          'content.root.footer.attachments.upload.accessibilityLabel'
        )}
        style={{
          height: DEFAULT_HEIGHT,
          marginLeft: StyleConstants.Spacing.Global.PagePadding,
          marginTop: StyleConstants.Spacing.Global.PagePadding,
          marginBottom: StyleConstants.Spacing.Global.PagePadding,
          width: DEFAULT_HEIGHT,
          backgroundColor: colors.backgroundOverlayInvert
        }}
        onPress={async () => {
          analytics('compose_attachment_add_container_press')
          await chooseAndUploadAttachment({
            composeDispatch,
            showActionSheetWithOptions
          })
        }}
      >
        <Button
          type='icon'
          content='UploadCloud'
          spacing='M'
          round
          overlay
          onPress={async () => {
            analytics('compose_attachment_add_button_press')
            await chooseAndUploadAttachment({
              composeDispatch,
              showActionSheetWithOptions
            })
          }}
          style={{
            position: 'absolute',
            top:
              (DEFAULT_HEIGHT -
                StyleConstants.Spacing.M * 2 -
                StyleConstants.Font.Size.M) /
              2,
            left:
              (DEFAULT_HEIGHT -
                StyleConstants.Spacing.M * 2 -
                StyleConstants.Font.Size.M) /
              2
          }}
        />
      </Pressable>
    ),
    []
  )
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
          name={composeState.attachments.sensitive ? 'CheckCircle' : 'Circle'}
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
        snapToOffsets={snapToOffsets}
        keyboardShouldPersistTaps='always'
        showsHorizontalScrollIndicator={false}
        data={composeState.attachments.uploads}
        keyExtractor={item =>
          item.local?.uri || item.remote?.url || Math.random().toString()
        }
        ListFooterComponent={
          composeState.attachments.uploads.length < maxAttachments
            ? listFooter
            : null
        }
      />
    </View>
  )
}

export default React.memo(ComposeAttachments, () => true)

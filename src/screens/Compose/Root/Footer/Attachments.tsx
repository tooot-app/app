import analytics from '@components/analytics'
import Button from '@components/Button'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useNavigation } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import FastImage from 'react-native-fast-image'
import ComposeContext from '../../utils/createContext'
import { ExtendedAttachment } from '../../utils/types'
import addAttachment from './addAttachment'

const DEFAULT_HEIGHT = 200

const ComposeAttachments: React.FC = () => {
  const { showActionSheetWithOptions } = useActionSheet()
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { t } = useTranslation('sharedCompose')
  const { theme } = useTheme()
  const navigation = useNavigation()

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

  const calculateWidth = useCallback(item => {
    if (item.local) {
      return (item.local.width / item.local.height) * DEFAULT_HEIGHT
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
          style={[styles.container, { width: calculateWidth(item) }]}
        >
          <FastImage
            style={styles.image}
            source={{
              uri: item.local?.local_thumbnail || item.remote?.preview_url
            }}
          />
          {item.remote?.meta?.original?.duration && (
            <Text
              style={[
                styles.duration,
                {
                  color: theme.background,
                  backgroundColor: theme.backgroundOverlay
                }
              ]}
            >
              {item.remote.meta.original.duration}
            </Text>
          )}
          {item.uploading ? (
            <View
              style={[
                styles.uploading,
                { backgroundColor: theme.backgroundOverlay }
              ]}
            >
              <Circle
                size={StyleConstants.Font.Size.L}
                color={theme.primaryOverlay}
              />
            </View>
          ) : (
            <View style={styles.actions}>
              <Button
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
        style={[
          styles.container,
          {
            width: DEFAULT_HEIGHT,
            backgroundColor: theme.backgroundOverlay
          }
        ]}
        onPress={async () => {
          analytics('compose_attachment_add_container_press')
          await addAttachment({ composeDispatch, showActionSheetWithOptions })
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
            await addAttachment({ composeDispatch, showActionSheetWithOptions })
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
    <View style={styles.base}>
      <Pressable style={styles.sensitive} onPress={sensitiveOnPress}>
        <Icon
          name={composeState.attachments.sensitive ? 'CheckCircle' : 'Circle'}
          size={StyleConstants.Font.Size.L}
          color={theme.primary}
        />
        <Text style={[styles.sensitiveText, { color: theme.primary }]}>
          {t('content.root.footer.attachments.sensitive')}
        </Text>
      </Pressable>
      <FlatList
        horizontal
        ref={flatListRef}
        decelerationRate={0}
        pagingEnabled={false}
        snapToAlignment='center'
        renderItem={renderAttachment}
        snapToOffsets={snapToOffsets}
        keyboardShouldPersistTaps='handled'
        showsHorizontalScrollIndicator={false}
        data={composeState.attachments.uploads}
        keyExtractor={item =>
          item.local?.uri || item.remote?.url || Math.random().toString()
        }
        ListFooterComponent={
          composeState.attachments.uploads.length < 4 ? listFooter : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    marginRight: StyleConstants.Spacing.Global.PagePadding,
    marginTop: StyleConstants.Spacing.M
  },
  sensitive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: StyleConstants.Spacing.Global.PagePadding
  },
  sensitiveText: {
    ...StyleConstants.FontStyle.M,
    marginLeft: StyleConstants.Spacing.S
  },
  container: {
    height: DEFAULT_HEIGHT,
    marginLeft: StyleConstants.Spacing.Global.PagePadding,
    marginTop: StyleConstants.Spacing.Global.PagePadding,
    marginBottom: StyleConstants.Spacing.Global.PagePadding
  },
  image: {
    width: '100%',
    height: '100%'
  },
  duration: {
    position: 'absolute',
    bottom: StyleConstants.Spacing.S,
    left: StyleConstants.Spacing.S,
    ...StyleConstants.FontStyle.S,
    paddingLeft: StyleConstants.Spacing.S,
    paddingRight: StyleConstants.Spacing.S,
    paddingTop: StyleConstants.Spacing.XS,
    paddingBottom: StyleConstants.Spacing.XS
  },
  uploading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actions: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignContent: 'flex-end',
    alignItems: 'flex-end',
    padding: StyleConstants.Spacing.S
  }
})

export default React.memo(ComposeAttachments, () => true)

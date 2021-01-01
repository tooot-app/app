import { Feather } from '@expo/vector-icons'
import Button from '@components/Button'
import { useNavigation } from '@react-navigation/native'
import { ComposeContext } from '@screens/Shared/Compose'
import addAttachment from '@screens/Shared/Compose/addAttachment'
import { ExtendedAttachment } from '@screens/Shared/Compose/utils/types'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react'
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { Chase } from 'react-native-animated-spinkit'
import layoutAnimation from '@root/utils/styles/layoutAnimation'
import haptics from '@root/components/haptics'

const DEFAULT_HEIGHT = 200

const ComposeAttachments: React.FC = () => {
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { theme } = useTheme()
  const navigation = useNavigation()

  const flatListRef = useRef<FlatList>(null)
  let prevOffsets = useRef<number[]>()

  const sensitiveOnPress = useCallback(
    () =>
      composeDispatch({
        type: 'attachments/sensitive',
        payload: { sensitive: !composeState.attachments.sensitive }
      }),
    [composeState.attachments.sensitive]
  )

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

  useEffect(() => {
    if (
      snapToOffsets.length >
      (prevOffsets.current ? prevOffsets.current?.length : 0)
    ) {
      flatListRef.current?.scrollToOffset({
        offset:
          snapToOffsets[snapToOffsets.length - 2] +
          snapToOffsets[snapToOffsets.length - 1]
      })
    }
    prevOffsets.current = snapToOffsets
  }, [snapToOffsets, prevOffsets])

  const renderAttachment = useCallback(
    ({ item, index }: { item: ExtendedAttachment; index: number }) => {
      return (
        <View
          key={index}
          style={[styles.container, { width: calculateWidth(item) }]}
        >
          <Image
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
              <Chase
                size={StyleConstants.Font.Size.L * 2}
                color={theme.primaryOverlay}
              />
            </View>
          ) : (
            <>
              <Button
                type='icon'
                content='x'
                spacing='M'
                round
                overlay
                style={styles.delete}
                onPress={() => {
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
                content='edit'
                spacing='M'
                round
                overlay
                style={styles.edit}
                onPress={() =>
                  navigation.navigate('Screen-Shared-Compose-EditAttachment', {
                    index
                  })
                }
              />
            </>
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
        onPress={async () => await addAttachment({ composeDispatch })}
      >
        <Button
          type='icon'
          content='upload-cloud'
          spacing='M'
          round
          overlay
          onPress={async () => await addAttachment({ composeDispatch })}
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
        <Feather
          name={composeState.attachments.sensitive ? 'check-circle' : 'circle'}
          size={StyleConstants.Font.Size.L}
          color={theme.primary}
        />
        <Text style={[styles.sensitiveText, { color: theme.primary }]}>
          标记媒体为敏感内容
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
        keyExtractor={item => item.local!.uri || item.remote!.url}
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
  delete: {
    position: 'absolute',
    top: StyleConstants.Spacing.S,
    right: StyleConstants.Spacing.S
  },
  edit: {
    position: 'absolute',
    bottom: StyleConstants.Spacing.S,
    right: StyleConstants.Spacing.S
  }
})

export default React.memo(ComposeAttachments, () => true)

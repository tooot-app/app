import { useEffect, useState } from 'react'
import { Appearance, Platform, Pressable, Text } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import RNFS from 'react-native-fs'
import { ShareMenuReactView } from 'react-native-share-menu'
import uuid from 'react-native-uuid'

// mimeType
// text/plain - text only, website URL, video?!
// image/jpeg - image
// video/mp4 - video

const colors = {
  primary: {
    light: 'rgb(18, 18, 18)',
    dark: 'rgb(180, 180, 180)'
  },
  background: {
    light: 'rgb(250, 250, 250)',
    dark: 'rgb(18, 18, 18)'
  }
}

const clearDir = async (dir: string) => {
  try {
    const files = await RNFS.readDir(dir)
    for (const file of files) {
      await RNFS.unlink(file.path)
    }
  } catch (err: any) {
    console.warn(err.message)
  }
}

const ShareExtension = () => {
  const [errorMessage, setErrorMessage] = useState<string>()

  useEffect(() => {
    ShareMenuReactView.data().then(async ({ data }) => {
      console.log('length', data.length)
      const newData = []
      switch (Platform.OS) {
        case 'ios':
          for (const d of data) {
            if (d.data.startsWith('file:///')) {
              const extension = d.data.split('.').pop()?.toLowerCase()
              const filename = `${uuid.v4()}.${extension}`
              const groupDirectory = await RNFS.pathForGroup(
                'group.com.xmflsct.app.tooot'
              )
              await clearDir(groupDirectory)
              const newFilepath = `file://${groupDirectory}/${filename}`
              console.log('newFilepath', newFilepath)
              try {
                await RNFS.copyFile(d.data, newFilepath)
                newData.push({ ...d, data: newFilepath })
              } catch (err: any) {
                setErrorMessage(err.message)
                console.warn(err.message)
              }
            } else {
              newData.push(d)
            }
          }
          break
        case 'android':
          break
        default:
          return
      }
      console.log('new data', newData)
      if (!errorMessage) {
        ShareMenuReactView.continueInApp({ share: newData })
      }
    })
  }, [])

  const theme = Appearance.getColorScheme() || 'light'

  return (
    <Pressable
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background[theme]
      }}
      onPress={() => {
        if (errorMessage) {
          ShareMenuReactView.dismissExtension(errorMessage)
        }
      }}
    >
      {!errorMessage ? (
        <Text style={{ fontSize: 16, color: colors.primary[theme] }}>
          {errorMessage}
        </Text>
      ) : (
        <Circle size={18} color={colors.primary[theme]} />
      )}
    </Pressable>
  )
}

export default ShareExtension

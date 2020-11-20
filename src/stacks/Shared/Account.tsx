import React, { useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import SegmentedControl from '@react-native-community/segmented-control'
import { Feather } from '@expo/vector-icons'

// import * as relationshipsSlice from 'src/stacks/common/relationshipsSlice'

import ParseContent from 'src/components/ParseContent'
import Timeline from 'src/stacks/common/Timeline'
import { useQuery } from 'react-query'
import { accountFetch } from '../common/accountFetch'

// Moved account example: https://m.cmx.im/web/accounts/27812

const Header = ({
  uri,
  size
}: {
  uri: string
  size: { width: number; height: number }
}) => {
  if (uri) {
    const heightRatio = size ? size.height / size.width : 1 / 2
    return (
      <Image
        source={{ uri: uri }}
        style={[
          styles.header,
          {
            height:
              Dimensions.get('window').width *
              (heightRatio > 0.5 ? 1 / 2 : heightRatio)
          }
        ]}
      />
    )
  } else {
    return (
      <View
        style={[
          styles.header,
          { height: Dimensions.get('window').width * (1 / 3) }
        ]}
      />
    )
  }
}

const Information = ({
  account,
  emojis
}: {
  account: Mastodon.Account
  emojis: Mastodon.Emoji[]
}) => {
  return (
    <View style={styles.information}>
      {/* <Text>Moved or not: {account.moved}</Text> */}
      <Image source={{ uri: account.avatar }} style={styles.avatar} />

      <Text style={styles.display_name}>
        {account.display_name || account.username}
        {account.bot && (
          <Feather name='hard-drive' style={styles.display_name} />
        )}
      </Text>
      <Text style={styles.account}>
        {account.acct}
        {account.locked && <Feather name='lock' />}
      </Text>

      {account.fields &&
        account.fields.map((field, index) => (
          <View key={index} style={{ flex: 1, flexDirection: 'row' }}>
            <Text style={{ width: '30%', alignSelf: 'center' }}>
              <ParseContent content={field.name} emojis={emojis} showFullLink />{' '}
              {field.verified_at && <Feather name='check-circle' />}
            </Text>
            <Text style={{ width: '70%' }}>
              <ParseContent
                content={field.value}
                emojis={emojis}
                showFullLink
              />
            </Text>
          </View>
        ))}
      {account.note && <ParseContent content={account.note} emojis={emojis} />}
      <Text>
        加入时间{' '}
        {new Date(account.created_at).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </Text>

      <Text>Toots: {account.statuses_count}</Text>
      <Text>Followers: {account.followers_count}</Text>
      <Text>Following: {account.following_count}</Text>
    </View>
  )
}

const Toots = ({ account }: { account: string }) => {
  const [segment, setSegment] = useState(0)
  const [segmentManuallyTriggered, setSegmentManuallyTriggered] = useState(
    false
  )
  const horizontalPaging = useRef<any>()

  const pages = ['Account_Default', 'Account_All', 'Account_Media']

  return (
    <>
      <SegmentedControl
        values={['嘟嘟', '嘟嘟和回复', '媒体']}
        selectedIndex={segment}
        onChange={({ nativeEvent }) => {
          setSegmentManuallyTriggered(true)
          setSegment(nativeEvent.selectedSegmentIndex)
          horizontalPaging.current.scrollToIndex({
            index: nativeEvent.selectedSegmentIndex
          })
        }}
        style={{ width: '100%', height: 30 }}
      />
      <FlatList
        style={{ width: Dimensions.get('window').width, height: '100%' }}
        data={pages}
        keyExtractor={page => page}
        renderItem={({ item, index }) => {
          return (
            <View style={{ width: Dimensions.get('window').width }}>
              <Timeline
                key={index}
                page={item}
                account={account}
                disableRefresh
                scrollEnabled={false}
              />
            </View>
          )
        }}
        ref={horizontalPaging}
        bounces={false}
        getItemLayout={(data, index) => ({
          length: Dimensions.get('window').width,
          offset: Dimensions.get('window').width * index,
          index
        })}
        horizontal
        onMomentumScrollEnd={() => {
          setSegmentManuallyTriggered(false)
        }}
        onScroll={({ nativeEvent }) =>
          !segmentManuallyTriggered &&
          setSegment(
            nativeEvent.contentOffset.x <= Dimensions.get('window').width / 3
              ? 0
              : 1
          )
        }
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
    </>
  )
}

export interface Props {
  route: {
    params: {
      id: string
    }
  }
}

const Account: React.FC<Props> = ({
  route: {
    params: { id }
  }
}) => {
  const { isLoading, isFetchingMore, isError, isSuccess, data } = useQuery(
    ['Account', { id }],
    accountFetch
  )

  // const stateRelationships = useSelector(relationshipsState)
  interface isHeaderImageSize {
    width: number
    height: number
  }
  const [headerImageSize, setHeaderImageSize] = useState<
    isHeaderImageSize | undefined
  >(undefined)

  useEffect(() => {
    if (isSuccess && data.header) {
      Image.getSize(data.header, (width, height) => {
        setHeaderImageSize({ width, height })
      })
    } else {
      setHeaderImageSize({ width: 3, height: 1 })
    }
  }, [data, isSuccess])

  // add emoji support
  return isSuccess && headerImageSize ? (
    <ScrollView>
      {headerImageSize && (
        <Header
          uri={data.header}
          size={{
            width: headerImageSize.width,
            height: headerImageSize.height
          }}
        />
      )}
      <Information account={data} emojis={data.emojis} />
      <Toots account={id} />
    </ScrollView>
  ) : (
    <></>
  )
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: 'gray'
  },
  information: { marginTop: -30, paddingLeft: 12, paddingRight: 12 },
  avatar: {
    width: 90,
    height: 90
  },
  display_name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12
  },
  account: {
    marginTop: 4
  }
})

export default Account

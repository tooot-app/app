import { MenuRow } from '@components/Menu'
import { StackScreenProps } from '@react-navigation/stack'
import TimelineEmpty from '@root/components/Timelines/Timeline/Empty'
import { useListsQuery } from '@utils/queryHooks/lists'
import React, { useMemo } from 'react'

const ScreenMeLists: React.FC<StackScreenProps<
  Nav.TabMeStackParamList,
  'Tab-Me-Switch'
>> = ({ navigation }) => {
  const { status, data, refetch } = useListsQuery({})

  const children = useMemo(() => {
    if (status === 'success') {
      return data?.map((d: Mastodon.List, i: number) => (
        <MenuRow
          key={i}
          iconFront='List'
          title={d.title}
          onPress={() =>
            navigation.navigate('Tab-Me-Lists-List', {
              list: d.id,
              title: d.title
            })
          }
        />
      ))
    } else {
      return <TimelineEmpty status={status} refetch={refetch} />
    }
  }, [status])

  return <>{children}</>
}

export default ScreenMeLists

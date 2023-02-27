import { HeaderLeft } from '@components/Header'
import { ParseEmojis } from '@components/Parse'
import CustomText from '@components/Text'
import Timeline from '@components/Timeline'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect } from 'react'
import { Trans } from 'react-i18next'

const TabSharedAttachments: React.FC<TabSharedStackScreenProps<'Tab-Shared-Attachments'>> = ({
  navigation,
  route: {
    params: { account }
  }
}) => {
  const { colors } = useTheme()

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} background />,
      headerTitle: () => (
        <CustomText numberOfLines={1}>
          <Trans
            ns='screenTabs'
            i18nKey='shared.attachments.name'
            components={[
              <ParseEmojis
                content={account.display_name || account.username}
                emojis={account.emojis}
                fontBold
              />,
              <CustomText
                fontStyle='M'
                style={{ color: colors.primaryDefault }}
                fontWeight='Bold'
              />
            ]}
          />
        </CustomText>
      ),
      headerBackVisible: false
    })
    navigation.setParams({ queryKey })
  }, [])

  const queryKey: QueryKeyTimeline = [
    'Timeline',
    {
      page: 'Account',
      type: 'attachments',
      id: account.id,
      ...(account._remote && { remote_id: account.id, remote_domain: account._remote })
    }
  ]

  return <Timeline queryKey={queryKey} />
}

export default TabSharedAttachments

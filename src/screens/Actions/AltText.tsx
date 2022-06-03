import Button from '@components/Button'
import MenuContainer from '@components/Menu/Container'
import MenuHeader from '@components/Menu/Header'
import CustomText from '@components/Text'
import { useNavigation } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

export interface Props {
  text: string
}

const ActionsAltText: React.FC<Props> = ({ text }) => {
  const navigation = useNavigation()
  const { t } = useTranslation('screenActions')
  const { colors } = useTheme()

  return (
    <>
      <MenuContainer>
        <MenuHeader heading={t(`content.altText.heading`)} />
        <ScrollView style={{ maxHeight: Dimensions.get('window').height / 2 }}>
          <CustomText style={{ color: colors.primaryDefault }}>
            {text}
          </CustomText>
        </ScrollView>
      </MenuContainer>
      <Button
        type='text'
        content={t('common:buttons.OK')}
        onPress={() => navigation.goBack()}
        style={{
          marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2
        }}
      />
    </>
  )
}

export default ActionsAltText

import openLink from '@components/openLink'
import navigationRef from '@utils/navigation/navigationRef'
import { getReadableAccounts, setAccount } from '@utils/storage/actions'
import * as Linking from 'expo-linking'
import { useEffect } from 'react'

// /compose OR /compose/@username@example.com

export const useLinking = () => {
  const parseLink = async (link: string | null) => {
    if (!link) return

    const parsed = Linking.parse(link)

    switch (parsed.scheme) {
      case 'tooot':
        if (parsed.hostname === 'compose') {
          if (parsed.path?.length) {
            const accounts = getReadableAccounts()
            const foundNotActiveAccount = accounts.find(
              account => account.acct === parsed.path && !account.active
            )
            if (foundNotActiveAccount) {
              await setAccount(foundNotActiveAccount.key)
            }
          }
          navigationRef.navigate('Screen-Compose')
        }
        break
      case 'https':
      case 'http':
        await openLink(link)
        break
    }
  }

  useEffect(() => {
    Linking.getInitialURL().then(parseLink)

    const listener = Linking.addEventListener('url', ({ url }) => parseLink(url))
    return () => listener.remove()
  }, [])
}

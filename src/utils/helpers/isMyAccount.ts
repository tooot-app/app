import { getAccountStorage } from '@utils/storage/actions'

export const checkIsMyAccount = (id?: Mastodon.Account['id']): boolean => {
  if (!id) return false

  const accountId = getAccountStorage.string('auth.account.id')
  const accountDomain = getAccountStorage.string('auth.account.domain')
  return accountId === id || `${accountId}@${accountDomain}` === id
}

import apiTooot from '@api/tooot'
import haptics from '@components/haptics'
import { AxiosError } from 'axios'
import * as Crypto from 'expo-crypto'
import { useQuery, UseQueryOptions } from 'react-query'

type Translations = {
  provider: string
  sourceLanguage: string
  text: string[]
}

export type QueryKeyTranslate = [
  'Translate',
  {
    uri: string
    source: string
    target: string
    text: string[]
  }
]

const queryFunction = async ({ queryKey }: { queryKey: QueryKeyTranslate }) => {
  const { uri, source, target, text } = queryKey[1]

  const uriEncoded = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    uri.replace(/https?:\/\//, ''),
    { encoding: Crypto.CryptoEncoding.HEX }
  )
  const original = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    JSON.stringify({ source, text }),
    { encoding: Crypto.CryptoEncoding.HEX }
  )

  const res = await apiTooot<Translations>({
    method: 'get',
    url: '/translate',
    headers: { original },
    body: { source, target, text }
  })
  haptics('Light')
  return res.body
}

const useTranslateQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyTranslate[1] & {
  options?: UseQueryOptions<Translations, AxiosError, Translations>
}) => {
  const queryKey: QueryKeyTranslate = ['Translate', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, { ...options, retry: false })
}

export { useTranslateQuery }

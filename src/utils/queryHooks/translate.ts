import apiGeneral from '@api/general'
import { AxiosError } from 'axios'
import { Buffer } from 'buffer'
import Constants from 'expo-constants'
import { useQuery, UseQueryOptions } from 'react-query'

type Translations = {
  provider: string
  sourceLanguage: string
  text: string[]
}

export type QueryKeyTranslate = [
  'Translate',
  {
    instance: string
    id: string
    source: string
    target: string
    text: string[]
  }
]

export const TRANSLATE_SERVER = __DEV__
  ? 'testtranslate.tooot.app'
  : 'translate.tooot.app'

const queryFunction = async ({ queryKey }: { queryKey: QueryKeyTranslate }) => {
  const key = Constants.manifest.extra?.translateKey
  if (!key) {
    return Promise.reject()
  }

  const { instance, id, source, target, text } = queryKey[1]

  const res = await apiGeneral<Translations>({
    domain: TRANSLATE_SERVER,
    method: 'get',
    url: `v1/translate/${instance}/${id}/${target}`,
    headers: {
      key,
      original: Buffer.from(JSON.stringify({ source, text })).toString('base64')
    }
  })
  return res.body
}

const useTranslateQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyTranslate[1] & {
  options?: UseQueryOptions<Translations, AxiosError, Translations>
}) => {
  const queryKey: QueryKeyTranslate = ['Translate', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export { useTranslateQuery }

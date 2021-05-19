import apiGeneral from '@api/general'
import { useQuery } from 'react-query'

export type QueryKeyTranslate = [
  'Translate',
  { toot: string; source: string; target: string }
]

const queryFunction = ({ queryKey }: { queryKey: QueryKeyTranslate }) => {
  const { toot, source, target } = queryKey[1]

  return apiGeneral<Translate.Translate>({
    domain: 'translate.tooot.app',
    method: 'post',
    url: 'translate',
    params: {
      api_key: '65180371-1ddb-4ec0-9aa3-ac47d371c41a',
      q: toot,
      source,
      target
    }
  }).then(res => res.body.translatedText)
}

const useTranslateQuery = (queryKeyParams: QueryKeyTranslate[1]) => {
  const queryKey: QueryKeyTranslate = ['Translate', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction)
}

export { useTranslateQuery }

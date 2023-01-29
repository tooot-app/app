import { mapEnvironment } from '@utils/helpers/checkEnvironment'
import { getGlobalStorage, setGlobalStorage } from '@utils/storage/actions'
import axios from 'axios'
import parse from 'url-parse'
import { userAgent } from '.'

const list = [
  'n61owz4leck',
  'z9skyp2f0m',
  'nc2dqtyxevj',
  'tgl97fgudrf',
  'eo2sj0ut2s',
  'a75auwihvyi',
  'vzkpud5y5b',
  '3uivf7yyex',
  'pxfoa1wbor',
  '3cor5jempc',
  '9o32znuepr',
  '9ayt1l2dzpi',
  '60iu4rz8js',
  'dzoa1lbxbv',
  '82rpiiqw21',
  'fblij1c9gyl',
  'wk2x048g8gl',
  '9x91yrbtmn',
  'dgu5p7eif6',
  'uftwyhrkgrh',
  'vv5hay15vjk',
  'ooj9ihtyur',
  'o8r7phzd58',
  'pujwyg269s',
  'l6yq5nr8lv',
  'ocyrlfmdnl',
  'rdtpeip5e2',
  'ykzb5784js',
  'm34z7j5us1i',
  'tqsfr0orqa',
  '8ncrt0mifa',
  'ygce2fdmsm',
  '22vk7csljz',
  '7mmb6hrih1',
  'grla5cpgau',
  '0vygyvs4k7',
  '1texbe32sf',
  'ckwvauiiol',
  'qkxryrbpxx',
  'ptb19c0ks9g',
  '3bpe76o6stg',
  'd507ejce9g',
  'jpul5v2mqej',
  '6m5uxemc79',
  'wxbtoo9t3p',
  '8qco3d0idh',
  'u00c2xiabvf',
  'hutkqwrcy8',
  't6vrkzhpzo',
  'wy6e529mnb',
  'kzzrlfa59pg',
  'mmo4sv4a7s',
  'u0dishl20k',
  '8qyx25bq3u',
  'd3mucdzlu1',
  'y123m81vsjl',
  '51opvzdo6k',
  'r4z333th9u',
  'q77hl0ggfr',
  'bsk1f2wi52g',
  'eubnxpv0pz',
  'h11pk7qm8i',
  'brhxw45vd5',
  'vtnvlsrn1z',
  '0q5w0hhzb5',
  'vq2rz02ayf',
  'hml3igfwkq',
  '39qs7vhenl',
  '5vcv775rug',
  'kjom5gr7i3',
  't2kmaoeb5x',
  'ni6ow1z11b',
  'yvgtoc3d88',
  'iax04eatnz',
  'esxyu9zujg',
  '73xa28n278',
  '5x63a8l24k',
  'dy1trb0b3sj',
  'd4c31j23m8',
  'ho76046l0j',
  'sw8lj5u2ef',
  'z5cn21mew5',
  'wxj73nmqwa',
  'gdj00dlx98',
  '0v76xag64i',
  'j35104qduhj',
  'l63r7h0ss6',
  'e5xdv7t1q0h',
  '4icoh8t4c8',
  'nbk36jt4sq',
  'zi0n0cv4tk',
  'o7qkfp3rxu',
  'xd2wefzd27',
  'rg7e6tsacx',
  '9lrq3s4vfm',
  'srs9p21lxoh',
  'n8xymau42t',
  'q5cik283fg',
  '68ye9feqs5',
  'xjc5anubnv'
]

export const CONNECT_DOMAIN = () =>
  mapEnvironment({
    release: `${list[Math.floor(Math.random() * (100 - 0) + 0)]}.tooot.app`,
    candidate: 'connect-candidate.tooot.app',
    development: 'connect-development.tooot.app'
  })

export const connectImage = ({
  uri
}: {
  uri?: string
}): { uri?: string; headers?: { 'x-tooot-domain': string } } => {
  const connect = getGlobalStorage.boolean('app.connect')
  if (connect) {
    if (uri) {
      const host = parse(uri).host
      return { uri: uri.replace(host, CONNECT_DOMAIN()), headers: { 'x-tooot-domain': host } }
    } else {
      return { uri }
    }
  } else {
    return { uri }
  }
}

export const connectVerify = () =>
  axios({
    method: 'get',
    baseURL: `https://${CONNECT_DOMAIN()}`,
    url: 'verify',
    headers: { ...userAgent }
  }).catch(err => {
    setGlobalStorage('app.connect', false)
    return Promise.reject(err)
  })

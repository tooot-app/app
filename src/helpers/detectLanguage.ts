import detect from 'react-native-language-detection'

const detectLanguage = async (
  text: string
): Promise<{ language: string; confidence: number } | null> => {
  const possibleLanguages = await detect(text).catch(() => {})
  return possibleLanguages ? possibleLanguages.filter(lang => lang.confidence > 0.5)?.[0] : null
}

export default detectLanguage

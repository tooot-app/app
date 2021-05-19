declare namespace Translate {
  type Detect = {
    confidence: number
    language: string
  }

  type Language = {
    code: string
    name: string
  }

  type Translate = {
    translatedText: string
  }
}

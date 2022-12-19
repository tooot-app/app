const adaptiveScale = (size: number, factor: number = 0) => Math.round(size + size * (factor / 8))

export { adaptiveScale }

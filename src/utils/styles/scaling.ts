const adaptiveScale = (size: number, factor: number = 0) =>
  factor ? Math.round(size + size * (factor / 8)) : size

export { adaptiveScale }

const getCurrentTab = (navigation: any) => {
  const {
    length,
    [length - 1]: last
  } = navigation.dangerouslyGetState().history
  return `Screen-${last.key.split(new RegExp(/Screen-(.*?)-/))[1]}`
}

export default getCurrentTab

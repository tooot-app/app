import AsyncStorage from '@react-native-async-storage/async-storage'

export async function getItem () {
  try {
    const value = await AsyncStorage.getItem('@social.xmflsct.com')
    if (!value) {
      await AsyncStorage.setItem(
        '@social.xmflsct.com',
        'qjzJ0IjvZ1apsn0_wBkGcdjKgX7Dao9KEPhGwggPwAo'
      )
    }
    return value
  } catch (e) {
    console.error('Get token error')
  }
}

export async function getAllKeys () {
  try {
    return await AsyncStorage.getAllKeys()
  } catch (e) {
    console.error('Get all keys error')
  }
}

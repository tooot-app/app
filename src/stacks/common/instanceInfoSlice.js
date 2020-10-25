import { createSlice } from '@reduxjs/toolkit'

const instanceInfoSlice = createSlice({
  name: 'instanceInfo',
  initialState: {},
  reducers: {
    // increment (state) {
    //   state.value++
    // },
    // decrement (state) {
    //   state.value--
    // },
    // incrementByAmount (state, action) {
    //   state.value += action.payload
    // }
  }
})

// export const getCurrent = state => state.current
// export const getCurrentToken = state => state.currentToken
// export const getRemote = state => state.remote

// export const { increment, decrement, incrementByAmount } = counterSlice.actions
export default instanceInfoSlice.reducer


import React from 'react'
import { Stack } from 'expo-router'

const HeaderShowFalse = () => {
  return (
        <Stack.Screen
        options={{   headerShown: false  }}
      />
  )
}

export default HeaderShowFalse


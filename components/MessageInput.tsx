import { TextInput, TextInputProps } from 'react-native'
import React from 'react'

const MessageInput = (props: TextInputProps) => {
  const {style, ...rest} = props
  return (
    <TextInput {...rest} className={`p-18 text-lg rounded-lg bg-[#262626] text-white ${style}`}>

    </TextInput>
  )
}

export default MessageInput
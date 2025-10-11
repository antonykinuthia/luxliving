import { TextInput, TextInputProps } from 'react-native'
import React from 'react'

const MessageInput = (props: TextInputProps) => {
  const {style, ...rest} = props
  return (
    <TextInput {...rest} className={`p-2 text-lg rounded-lg bg-white shadow-lg shadow-black-100/70 outline-none  text-black-200 ${style}`}>

    </TextInput>
  )
}

export default MessageInput
import React from 'react'
import { Terminal } from './Terminal'

export type TerminalThemedProps = {
  visible: boolean
}

export const TerminalThemed: React.FC<TerminalThemedProps> = ({ visible }) => {
  return <Terminal visible={visible} />
}

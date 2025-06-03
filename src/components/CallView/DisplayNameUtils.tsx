import React, { memo } from 'react'
import { TFunction } from 'i18next'
import TextScroll from '../TextScroll'

interface DisplayTextProps {
  intrudeListenStatus: any
  displayName: string | undefined
  incoming: boolean | undefined
  t: TFunction
}

interface TextClassNameProps {
  intrudeListenStatus: any
  animateText: boolean
}

export interface DisplayTextResult {
  type: 'text' | 'scroll'
  content: string
}

const MemoizedTextScroll = memo(TextScroll)

export const getDisplayText = ({
  intrudeListenStatus,
  displayName,
  incoming,
  t,
}: DisplayTextProps): DisplayTextResult => {
  if (intrudeListenStatus?.isIntrude) {
    const extension = intrudeListenStatus?.isIntrudeExtension
    return {
      type: 'text',
      content:
        extension && extension !== ''
          ? `${t('Common.Intrude')}-${extension}`
          : t('Common.Intrude'),
    }
  }

  if (intrudeListenStatus?.isListen) {
    const extension = intrudeListenStatus?.isListenExtension
    return {
      type: 'text',
      content:
        extension && extension !== '' ? `${t('Common.Listen')}-${extension}` : t('Common.Listen'),
    }
  }

  if (displayName && displayName === '<unknown>') {
    return { type: 'text', content: 'PBX' }
  }

  if (displayName) {
    return { type: 'scroll', content: displayName }
  }

  return {
    type: 'text',
    content: incoming ? t('Call.Incoming call') || '-' : t('Call.Outgoing call') || '-',
  }
}

export const getTextClassName = ({ intrudeListenStatus, animateText }: TextClassNameProps) => {
  const baseClass =
    'pi-relative pi-inline-block pi-font-medium pi-text-primaryNeutral dark:pi-text-primaryNeutralDark'

  if (intrudeListenStatus?.isIntrude || intrudeListenStatus?.isListen) {
    return `pi-w-fit ${baseClass} ${animateText ? 'animated-text' : ''}`
  }

  return `${baseClass} ${animateText ? 'pi-animate-scroll-text' : ''}`
}

export { MemoizedTextScroll }

import { TFunction } from 'i18next'

interface DisplayTextProps {
  intrudeListenStatus: any
  displayName: string | undefined
  incoming: boolean | undefined
  t: TFunction
}

export interface DisplayTextResult {
  type: 'text' | 'scroll'
  content: string
}

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

export const getTextClassName = () =>
  'pi-relative pi-block pi-max-w-full pi-font-medium pi-text-primaryNeutral dark:pi-text-primaryNeutralDark'

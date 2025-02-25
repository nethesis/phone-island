import { isEmpty } from './genericFunctions/isEmpty'

export const getAvailableDevices = (userInfo: any, allUsers: any) => {
  // Get IDs of devices with active conversations
  const activeConversationIds = Object.keys(userInfo?.conversations || {}).filter(
    (id) => !isEmpty(userInfo.conversations[id]),
  )

  // Filter online devices that are not in conversations
  return (
    userInfo?.endpoints?.extension?.filter(
      (device: any) =>
        allUsers?.extensions[device?.id]?.status === 'online' &&
        !activeConversationIds?.includes(device?.id) &&
        device?.type !== 'webrtc' &&
        device?.type !== 'nethlink',
    ) || []
  )
}

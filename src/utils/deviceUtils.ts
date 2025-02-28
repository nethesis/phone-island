import { isEmpty } from './genericFunctions/isEmpty'

export const getAvailableDevices = (userInfo: any, allUsers: any) => {
  // Return empty array if required data is missing
  if (!userInfo?.endpoints?.extension || !allUsers?.extensions) {
    return []
  }

  // Get IDs of devices with active conversations
  const activeConversationIds = Object.keys(userInfo?.conversations || {}).filter(
    (id) => !isEmpty(userInfo?.conversations[id]),
  )

  // Filter online devices that are not in conversations
  return userInfo.endpoints.extension.filter((device: any) => {
    const deviceId = device?.id
    const deviceStatus = allUsers?.extensions[deviceId]?.status

    return (
      deviceId &&
      deviceStatus === 'online' &&
      !activeConversationIds?.includes(deviceId) &&
      device.type !== 'webrtc' &&
      device.type !== 'nethlink'
    )
  })
}

import { store } from '../../store'
import { openVideoSource } from '../../services/user'

/**
 * Handle streaming source unlock/door opening
 */
export const handleStreamingUnlock = async () => {
  const { streamingSourceNumber } = store.getState().currentCall
  const { videoSources } = store.getState().streaming

  if (!streamingSourceNumber || !videoSources) return

  const source = Object.values(videoSources).find(
    (source) => source.extension === streamingSourceNumber,
  )
  if (!source) return

  try {
    await openVideoSource({ id: source.id })
    console.log('Door unlocked successfully')
  } catch (error) {
    console.error('Error unlocking door:', error)
  }
}

declare global {
	interface HTMLAudioElement {
		setSinkId(sinkId: string): Promise<void>
	}
}

declare const JanusLib: any

export default JanusLib
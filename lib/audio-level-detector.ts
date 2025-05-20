export class AudioLevelDetector {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null
  private dataArray: Uint8Array | null = null
  private stream: MediaStream | null = null
  private callback: ((level: number) => void) | null = null
  private animationFrame: number | null = null
  private threshold = 0.2 // Threshold to detect speaking (0-1)

  /**
   * Start detecting audio levels from a media stream
   * @param stream The MediaStream to analyze
   * @param callback Function called with audio level (0-1) when levels change
   */
  start(stream: MediaStream, callback: (level: number) => void): void {
    if (!stream.getAudioTracks().length) {
      console.warn("No audio tracks in stream")
      return
    }

    this.stream = stream
    this.callback = callback

    // Create audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.analyser = this.audioContext.createAnalyser()

    // Configure analyser
    this.analyser.fftSize = 256
    this.analyser.smoothingTimeConstant = 0.8
    const bufferLength = this.analyser.frequencyBinCount
    this.dataArray = new Uint8Array(bufferLength)

    // Connect stream to analyser
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream)
    this.mediaStreamSource.connect(this.analyser)

    // Start analyzing
    this.analyze()
  }

  /**
   * Stop audio level detection and clean up resources
   */
  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect()
      this.mediaStreamSource = null
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch((err) => console.error("Error closing audio context:", err))
    }

    this.analyser = null
    this.dataArray = null
    this.stream = null
    this.callback = null
  }

  /**
   * Set speaking detection threshold
   * @param threshold Value between 0-1, lower values make detection more sensitive
   */
  setThreshold(threshold: number): void {
    this.threshold = Math.max(0, Math.min(1, threshold))
  }

  /**
   * Analyze audio levels from the stream
   */
  private analyze = (): void => {
    if (!this.analyser || !this.dataArray || !this.callback) {
      return
    }

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray)

    // Calculate average level
    let sum = 0
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i]
    }

    const average = sum / this.dataArray.length
    const normalizedLevel = average / 255 // Convert to 0-1 range

    // Call callback with level
    this.callback(normalizedLevel)

    // Continue analyzing
    this.animationFrame = requestAnimationFrame(this.analyze)
  }

  /**
   * Check if audio level indicates the user is speaking
   * @param level Audio level between 0-1
   * @returns Boolean indicating if user is likely speaking
   */
  isSpeaking(level: number): boolean {
    return level > this.threshold
  }
}

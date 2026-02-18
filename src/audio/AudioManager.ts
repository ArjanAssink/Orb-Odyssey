export class AudioManager {
  private ctx: AudioContext | null = null

  /** Must be called from a user-gesture handler (e.g. button click) to unlock AudioContext. */
  init(): void {
    if (this.ctx) return
    this.ctx = new AudioContext()
  }

  playCollect(): void {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, t)
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.12)

    gain.gain.setValueAtTime(0.25, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)

    osc.start(t)
    osc.stop(t + 0.25)
  }

  playLevelComplete(): void {
    if (!this.ctx) return
    const freqs = [523, 659, 784, 1047] // C5 E5 G5 C6
    freqs.forEach((freq, i) => {
      const t = this.ctx!.currentTime + i * 0.15
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()
      osc.connect(gain)
      gain.connect(this.ctx!.destination)
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      osc.start(t)
      osc.stop(t + 0.4)
    })
  }
}

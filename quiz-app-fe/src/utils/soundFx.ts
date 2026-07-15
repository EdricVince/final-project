let ctx: AudioContext | null = null

const getCtx = () => {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

const tone = (freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.3) => {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, c.currentTime + duration)
    gain.gain.setValueAtTime(vol, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration)
  } catch { /* ignore if audio not available */ }
}

export const sfx = {
  correct: () => {
    tone(523, 0.1, 'sine', 0.25)
    setTimeout(() => tone(659, 0.12, 'sine', 0.25), 80)
    setTimeout(() => tone(784, 0.15, 'sine', 0.25), 160)
  },
  wrong: () => {
    tone(300, 0.08, 'square', 0.2)
    setTimeout(() => tone(220, 0.2, 'square', 0.15), 80)
  },
  combo: (level: number) => {
    const freqs = [523, 659, 784, 1047]
    freqs.slice(0, Math.min(level, 4)).forEach((f, i) => {
      setTimeout(() => tone(f, 0.1, 'sine', 0.2), i * 70)
    })
  },
  levelUp: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      setTimeout(() => tone(f, 0.15, 'sine', 0.3), i * 80)
    })
  },
  click: () => tone(880, 0.05, 'sine', 0.1),
  flip: () => tone(440, 0.08, 'triangle', 0.15),
  streak: () => {
    tone(660, 0.1, 'sine', 0.2)
    setTimeout(() => tone(880, 0.2, 'sine', 0.25), 100)
  },
}

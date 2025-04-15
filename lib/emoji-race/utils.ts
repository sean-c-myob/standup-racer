import confetti from "canvas-confetti"

// List of possible emojis - expanded with more diverse and fun options
export const emojiList = [
  // Animals
  "🦆", "🐥", "🐤", "🐣", "🦢", "🦩", "🦚", "🦜", "🦉", "🦅", "🦄", "🐴", "🐎", "🦓", "🦌", 
  "🐮", "🐷", "🐹", "🐰", "🐻", "🐼", "🐨", "🐯", "🦁", "🐶", "🐱", "🐭", "🐵", "🐸", "🐢",
  // More animals
  "🦊", "🦝", "🐺", "🦬", "🦧", "🦍", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🦥", "🦦",
  "🦫", "🐿️", "🦔", "🐇", "🐁", "🐀", "🦡", "🐊", "🐅", "🐆", "🦭", "🦙", "🦣", "🐃", "🐂",
  // Sea creatures
  "🐟", "🐠", "🐡", "🦈", "🐙", "🐬", "🐳", "🐋", "🦑", "🦐", "🦞", "🦀", "🐚", "🐌", "🦕",
  // Fantasy/fun
  "👻", "🤖", "👽", "👾", "🛸", "🚀", "🏎️", "🚗", "🚲", "🛹", "🛼", "⛸️", "🏄", "🏇", "🧚",
  "🧙", "🧛", "🧟", "🧞", "🕴️", "🚶", "🧗", "🏃", "💃", "🕺", "🦸", "🦹", "🧜", "🧝", "🥷",
  // Foods and objects
  "🍕", "🍔", "🌮", "🌯", "🍦", "🍭", "🍬", "🧁", "🍓", "🍎", "🍒", "🥝", "🍋", "⚽", "🏀",
  "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "⛳", "🎮", "💎", "🔮", "🧸", "🎈", "🎁", "💫", "⭐"
]

// Generate emojis for participants - uses index-based selection for server-side rendering
export const generateEmojis = (count: number): string[] => {
  // For SSR, provide deterministic initial values
  const isClient = typeof window !== 'undefined'
  
  return Array(count)
    .fill(0)
    .map((_, index) => {
      // On the server, use a predictable pattern based on index
      if (!isClient) {
        return emojiList[index % emojiList.length]
      }
      
      // On the client, use random selection
      const randomIndex = Math.floor(Math.random() * emojiList.length)
      return emojiList[randomIndex]
    })
}

// Format time as MM:SS.ms (with 2 digits for milliseconds)
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100) // Get 2 digits for milliseconds

  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
}

// Trigger confetti animation
export const triggerConfetti = (): void => {
  const duration = 5 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)

    // Since particles fall down, start a bit higher than random
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0, 0.2) },
    })
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0, 0.2) },
    })
  }, 250)
}

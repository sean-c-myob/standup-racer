export interface Participant {
  name: string
  emoji: string
  position: number
  speed: number
}

export interface RaceState {
  participants: Participant[]
  isRacing: boolean
  timeLeft: number
  winner: number | null
  showWinnerModal: boolean
}

export interface RaceConfig {
  names: string[]
  raceTime: number
}

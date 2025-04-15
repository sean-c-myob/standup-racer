"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { generateEmojis, formatTime, triggerConfetti } from "@/lib/emoji-race/utils"

interface UseRaceProps {
  initialNames: string[]
  initialRaceTime: number
}

export function useRace({ initialNames, initialRaceTime }: UseRaceProps) {
  const [names, setNames] = useState<string[]>(initialNames)
  const [raceTime, setRaceTime] = useState<number>(initialRaceTime)
  const [isRacing, setIsRacing] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState<number>(initialRaceTime)
  const [positions, setPositions] = useState<number[]>([])
  const [emojis, setEmojis] = useState<string[]>([])
  const [baseSpeeds, setBaseSpeeds] = useState<number[]>([])
  const [winner, setWinner] = useState<number | null>(null)
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false)

  // Track if someone has finished
  const hasFinishedRef = useRef(false)

  // Track if race is ending
  const isEndingRef = useRef(false)

  // Track if we're in final sprint mode (ensuring someone finishes)
  const finalSprintRef = useRef(false)

  // Refs to preserve values in callbacks
  const isRacingRef = useRef(isRacing)
  const positionsRef = useRef(positions)
  const winnerRef = useRef(winner)
  const timeRef = useRef<number>(0)
  const raceTimeRef = useRef(raceTime)

  // For dynamic speed changes
  const lastSpeedChangeRef = useRef<number>(0)
  const currentSpeedsRef = useRef<number[]>([])

  // Store final positions to prevent jumps
  const finalPositionsRef = useRef<number[]>([])
  
  // Generate base speeds for participants - defining this function BEFORE it's used in effects
  const generateBaseSpeeds = useCallback((count: number, time: number) => {
    // More consistent base speed to ensure steady progress throughout race
    // Slight increase to ensure they finish within the allotted time
    const baseSpeed = 95 / time
    const isClient = typeof window !== 'undefined'
    
    return Array(count)
      .fill(0)
      .map((_, index) => {
        // For SSR, use deterministic multiplier based on index
        if (!isClient) {
          // Much smaller variation (between 0.95 and 1.05)
          const multiplier = 0.95 + (index % 7) * 0.015
          return baseSpeed * multiplier
        }
        
        // On client, very small random multiplier for more even racing
        // Just enough variation to create interest but not dramatic differences
        const multiplier = 0.95 + Math.random() * 0.1
        return baseSpeed * multiplier
      })
  }, [])

  // Update refs when state changes
  useEffect(() => {
    isRacingRef.current = isRacing
    positionsRef.current = positions
    winnerRef.current = winner
    raceTimeRef.current = raceTime
  }, [isRacing, positions, winner, raceTime])

  // Initialize race with emojis and positions
  useEffect(() => {
    if (emojis.length !== names.length) {
      // Only generate new emojis if the number of participants changed
      setEmojis(generateEmojis(names.length))
    }
    
    // Reset all participants to starting line
    setPositions(Array(names.length).fill(0))
  }, [names, emojis.length]);
  
  // Initialize base speeds
  useEffect(() => {
    // Generate new base speeds whenever the participants change
    const newBaseSpeeds = generateBaseSpeeds(names.length, raceTime)
    setBaseSpeeds(newBaseSpeeds)
  }, [names.length, raceTime, generateBaseSpeeds]);

  // Show winner modal and trigger confetti when winner is determined
  useEffect(() => {
    if (winner !== null) {
      // Set an immediate timeout to show the modal (fixes React state batching issues)
      setTimeout(() => {
        setShowWinnerModal(true)
        triggerConfetti()
      }, 0)

      // Reset timer to full race time when race finishes
      setTimeLeft(raceTime)
    }
  }, [winner, raceTime])

  // Apply random speed variations to create more dynamic racing
  const applySpeedVariations = useCallback((baseSpeeds: number[], currentTime: number) => {
    // Don't change speeds if race is ending
    if (isEndingRef.current) {
      return currentSpeedsRef.current
    }

    // Reduce frequency of speed changes (every 3-5 seconds) for more consistent movement
    if (currentTime - lastSpeedChangeRef.current > 3000 + Math.random() * 2000) {
      lastSpeedChangeRef.current = currentTime

      return baseSpeeds.map((baseSpeed, index) => {
        // Much smaller variations for more consistent speed
        // Only 0.95-1.05 variation for minimal speed changes
        let variation = 0.95 + Math.random() * 0.1

        // Very slight position-based adjustments (mostly cosmetic)
        const currentPos = positionsRef.current[index] || 0
        const isLeading = currentPos >= Math.max(...positionsRef.current) - 5

        // Minor adjustments that won't dramatically change speed
        if (isLeading && Math.random() > 0.8) {
          variation *= 0.98 // Barely noticeable slowdown
        }

        if (currentPos < Math.max(...positionsRef.current) - 20 && Math.random() > 0.7) {
          variation *= 1.02 // Barely noticeable speedup
        }

        return baseSpeed * variation
      })
    }

    return currentSpeedsRef.current
  }, [])

  // Race animation frame with dynamic speed changes
  useEffect(() => {
    let animationFrameId: number
    let startTime: number
    let lastUpdateTime: number
    let lastPositionUpdateTime: number = 0
    const POSITION_UPDATE_INTERVAL = 1000 / 30 // Limit to ~30 updates per second for smoother animation

    const updateRace = (currentTime: number) => {
      if (!startTime) {
        startTime = currentTime
        lastUpdateTime = currentTime
        lastPositionUpdateTime = currentTime
        // Initialize current speeds from base speeds
        currentSpeedsRef.current = [...baseSpeeds]
      }

      // Calculate elapsed time with high precision
      const elapsedSeconds = (currentTime - startTime) / 1000
      const deltaTime = currentTime - lastUpdateTime
      lastUpdateTime = currentTime

      if (isRacingRef.current) {
        // Update time left with millisecond precision
        const newTimeLeft = Math.max(raceTimeRef.current - elapsedSeconds, 0)
        setTimeLeft(newTimeLeft)
        timeRef.current = newTimeLeft

        // Remove the final sprint/acceleration logic completely
        // No special handling for final part of race

        if (winnerRef.current === null) {
          // Apply very minimal speed variations
          currentSpeedsRef.current = applySpeedVariations(baseSpeeds, currentTime)

          // Only update positions at a controlled rate (smoother visual updates)
          // This creates smoother animations by not updating positions too frequently
          if (currentTime - lastPositionUpdateTime >= POSITION_UPDATE_INTERVAL) {
            lastPositionUpdateTime = currentTime;
            
            // Update positions based on current speeds
            setPositions((prev) => {
              // If race is ending, use the stored final positions to prevent jumps
              if (isEndingRef.current && finalPositionsRef.current.length > 0) {
                return finalPositionsRef.current
              }

              // Calculate time since last position update for proper speed scaling
              const posUpdateDeltaTime = POSITION_UPDATE_INTERVAL; // Use fixed time delta for consistency

              const newPositions = prev.map((pos, index) => {
                // Move based on current speed and fixed time delta
                const increment = (currentSpeedsRef.current[index] * posUpdateDeltaTime) / 1000
                // Apply increment directly without additional catchup boosts
                const newPos = pos + increment

                // No catchup boost or additional acceleration
                return Math.min(newPos, 100) // Cap at 100%
              })

              // Check if anyone reached the finish line (100%)
              const finishedIndex = newPositions.findIndex((pos) => pos >= 100)
              if (finishedIndex !== -1 && !hasFinishedRef.current) {
                hasFinishedRef.current = true
                isEndingRef.current = true
                finalSprintRef.current = false

                // Store the current positions as final positions
                finalPositionsRef.current = [...newPositions]

                // Set winner immediately instead of after a delay
                setWinner(finishedIndex)

                // End the race after a short delay
                setTimeout(() => {
                  setIsRacing(false)
                  // Reset timer to full race time when race finishes
                  setTimeLeft(raceTimeRef.current)
                }, 300) // Reduced from 1000ms to 300ms
              }

              positionsRef.current = newPositions
              return newPositions
            })
          }

          // If time runs out and no winner yet, the furthest one wins
          if (timeRef.current <= 0 && winnerRef.current === null) {
            isEndingRef.current = true
            finalSprintRef.current = false

            // Find the leader
            const maxPosition = Math.max(...positionsRef.current)
            const leaderIndex = positionsRef.current.findIndex((pos) => pos === maxPosition)

            // Don't immediately set to 100% - set to a point closer to the finish
            // This will allow for a more natural approach to the finish line
            const finalPositions = [...positionsRef.current]
            // Move leader 80% of the way to the finish line
            finalPositions[leaderIndex] = maxPosition + (100 - maxPosition) * 0.8

            // Store and set these positions
            finalPositionsRef.current = finalPositions
            setPositions(finalPositions)

            // Set winner after a shorter delay
            setTimeout(() => {
              // Update positions one more time to reach finish line smoothly
              const lastPositions = [...finalPositionsRef.current]
              lastPositions[leaderIndex] = 100
              finalPositionsRef.current = lastPositions
              setPositions(lastPositions)
              
              setWinner(leaderIndex)

              // End the race after a shorter delay
              setTimeout(() => {
                setIsRacing(false)
                // Reset timer to full race time when race finishes
                setTimeLeft(raceTimeRef.current)
              }, 300) // Reduced from 1000ms to 300ms
            }, 500) // Reduced from 1500ms to 500ms
          }
        }

        if (isRacingRef.current) {
          animationFrameId = requestAnimationFrame(updateRace)
        }
      }
    }

    if (isRacing) {
      startTime = 0
      hasFinishedRef.current = false
      isEndingRef.current = false
      finalSprintRef.current = false
      finalPositionsRef.current = []
      animationFrameId = requestAnimationFrame(updateRace)
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isRacing, raceTime, baseSpeeds, applySpeedVariations])

  // Reset the race
  const resetRace = useCallback(() => {
    setIsRacing(false)
    setTimeLeft(raceTime)
    setPositions(Array(names.length).fill(0))
    setWinner(null)
    setShowWinnerModal(false)
    hasFinishedRef.current = false
    isEndingRef.current = false
    finalSprintRef.current = false
    lastSpeedChangeRef.current = 0
    finalPositionsRef.current = []

    // Generate new base speeds for each participant
    const newBaseSpeeds = generateBaseSpeeds(names.length, raceTime)
    setBaseSpeeds(newBaseSpeeds)
    currentSpeedsRef.current = [...newBaseSpeeds]
    
    // Small delay before allowing start - helps prevent immediate jumps
    return new Promise(resolve => setTimeout(resolve, 100));
  }, [names.length, raceTime, generateBaseSpeeds])

  // Start the race with a small delay to ensure clean animation start
  const startRace = useCallback(() => {
    resetRace().then(() => {
      // Small delay to ensure clean animation start
      setTimeout(() => {
        setIsRacing(true);
      }, 100);
    });
  }, [resetRace])

  // Update name
  const updateName = useCallback((index: number, value: string) => {
    setNames((prev) => {
      const newNames = [...prev]
      newNames[index] = value
      return newNames
    })
  }, [])

  // Add a new participant
  const addParticipant = useCallback(() => {
    setNames((prev) => [...prev, `Participant ${prev.length + 1}`])
    // Add a new emoji for the new participant
    setEmojis((prev) => [...prev, generateEmojis(1)[0]])
  }, [])

  // Remove a participant
  const removeParticipant = useCallback(
    (index: number) => {
      if (names.length > 1) {
        setNames((prev) => {
          const newNames = [...prev]
          newNames.splice(index, 1)
          return newNames
        })
        setEmojis((prev) => {
          const newEmojis = [...prev]
          newEmojis.splice(index, 1)
          return newEmojis
        })
      }
    },
    [names.length],
  )

  // Initialize race on mount
  useEffect(() => {
    resetRace()
  }, [resetRace])

  return {
    names,
    raceTime,
    isRacing,
    timeLeft,
    positions,
    emojis,
    winner,
    showWinnerModal,
    setShowWinnerModal,
    startRace,
    resetRace,
    updateName,
    addParticipant,
    removeParticipant,
    setRaceTime,
    formatTime,
  }
}

"use client"
import { useState, useEffect } from "react"

interface RaceTrackProps {
  names: string[]
  emojis: string[]
  positions: number[]
  winner: number | null
}

export default function RaceTrack({ names, emojis, positions, winner }: RaceTrackProps) {
  // Use state for vertical offsets instead of useMemo to avoid hydration mismatch
  const [verticalOffsets, setVerticalOffsets] = useState<number[]>([])
  
  // Generate vertical offsets after component mounts on client
  useEffect(() => {
    const offsets = names.map((_, index) => {
      // Calculate lane position - evenly distribute racers across the track height
      return index * (2.0 / Math.max(names.length, 1)) - 1.0 + (1.0 / Math.max(names.length, 1));
    });
    setVerticalOffsets(offsets)
  }, [names.length]) // Only regenerate when the number of names changes

  // Map race position percentage to visual position on track
  // This moves the start line to 5% and finish line to 95% of the track visually
  const getVisualPosition = (position: number) => {
    // Scale the 0-100 race progress to 5-95 visual range
    return 5 + (position * 0.9);
  }

  return (
    <div className="mb-8 ">
      {/* Single race track with multiple lanes */}
      <div className="flex mb-4">
        {/* Names column */}
        <div className="w-24 mr-2 flex flex-col justify-between py-1">
          {names.map((name, index) => (
            <div 
              key={`name-${index}`} 
              className="font-medium truncate flex items-center text-sm"
              style={{ height: `${100 / names.length}%`, marginBottom: names.length > 1 ? '0.25rem' : 0 }}
            >
              {name} {winner === index && <span className="ml-1 text-green-500">🏆</span>}
            </div>
          ))}
        </div>

        {/* Main track */}
        <div className="flex-1 relative">
          <div className="h-52 bg-white border-2 border-gray-400 rounded-lg relative overflow-hidden">
            {/* Lane separators */}
            {names.length > 1 && names.slice(0, -1).map((_, index) => (
              <div 
                key={`lane-${index}`} 
                className="absolute w-full h-px bg-gray-100 z-10"
                style={{ 
                  top: `${((index + 1) / names.length) * 100}%`,
                  backgroundImage: 'linear-gradient(to right, transparent 0%, rgba(200, 200, 200, 0.5) 5%, rgba(200, 200, 200, 0.5) 95%, transparent 100%)'
                }}
              />
            ))}

            {/* Start line */}
            <div className="absolute top-0 h-full w-1.5 bg-green-500 z-20" style={{ left: '5%' }}>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs font-bold">START</div>
            </div>

            {/* Finish line */}
            <div className="absolute top-0 h-full w-1.5 bg-red-500 z-20" style={{ left: '95%' }}>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs font-bold">FINISH</div>
            </div>

            {/* Emojis */}
            {names.map((_, index) => (
              <div 
                key={`emoji-${index}`}
                className="absolute"
                style={{
                  left: `${getVisualPosition(positions[index])}%`,
                  // Position in the center of their lane
                  top: `${((index + 0.5) / names.length) * 100}%`,
                  transform: `translate(-50%, -50%)`,
                  transition: 'left 200ms cubic-bezier(0.25, 0.1, 0.25, 1), top 500ms ease-out',
                  willChange: 'left',
                  zIndex: 30
                }}
              >
                <span 
                  className="text-4xl inline-block" 
                  style={{ 
                    animation: positions[index] > 0 ? 'small-bounce 0.4s ease infinite alternate' : 'none'
                  }}
                >
                  {emojis[index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Add animations for emojis */}
      <style jsx global>{`
        @keyframes small-bounce {
          from { transform: translateY(0) rotate(-5deg); }
          to { transform: translateY(-3px) rotate(5deg); }
        }
      `}</style>
    </div>
  )
}

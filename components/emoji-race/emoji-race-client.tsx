"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import RaceTrack from "@/components/emoji-race/race-track"
import RaceControls from "@/components/emoji-race/race-controls"
import SettingsPanel from "@/components/emoji-race/settings-panel"
import WinnerModal from "@/components/emoji-race/winner-modal"
import ShareLink from "@/components/emoji-race/share-link"
import { useRace } from "@/hooks/use-race"

export default function EmojiRaceClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get names and race time from query params or use defaults
  const namesParam = searchParams.get("names")
  const raceTimeParam = searchParams.get("raceTime")

  const initialNames = namesParam ? namesParam.split(",") : ["Alice", "Bob", "Charlie"]
  const initialRaceTime = raceTimeParam ? Number.parseInt(raceTimeParam) : 60

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [shareUrl, setShareUrl] = useState<string>("")

  const race = useRace({
    initialNames,
    initialRaceTime,
  })

  // Update the share URL
  const updateShareUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const url = new URL("/", baseUrl)
    url.searchParams.set("names", race.names.join(","))
    url.searchParams.set("raceTime", race.raceTime.toString())
    setShareUrl(url.toString())

    // Update browser URL without refreshing
    router.replace(`/?names=${race.names.join(",")}&raceTime=${race.raceTime}`)
  }

  // Update share URL when names or race time changes
  useEffect(() => {
    updateShareUrl()
  }, [race.names, race.raceTime])

  return (
    <>
      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className="text-5xl font-mono font-bold">{race.formatTime(race.timeLeft)}</div>
      </div>

      {/* Race Track */}
      <RaceTrack names={race.names} emojis={race.emojis} positions={race.positions} winner={race.winner} />

      {/* Controls */}
      <RaceControls
        isRacing={race.isRacing}
        onStart={race.startRace}
        onReset={race.resetRace}
        onToggleEdit={() => setIsEditing(!isEditing)}
        isEditing={isEditing}
      />

      {/* Settings Panel */}
      {isEditing && (
        <SettingsPanel
          names={race.names}
          raceTime={race.raceTime}
          onUpdateName={race.updateName}
          onRemoveParticipant={race.removeParticipant}
          onAddParticipant={race.addParticipant}
          onUpdateRaceTime={race.setRaceTime}
          onUpdateShareUrl={updateShareUrl}
        />
      )}

      {/* Share URL */}
      <ShareLink url={shareUrl} />

      {/* Winner Modal */}
      <WinnerModal
        isOpen={race.showWinnerModal}
        onClose={() => race.setShowWinnerModal(false)}
        winner={race.winner}
        names={race.names}
        emojis={race.emojis}
        onNewRace={race.resetRace}
      />
    </>
  )
} 
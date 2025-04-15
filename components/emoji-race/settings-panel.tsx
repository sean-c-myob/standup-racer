"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

interface SettingsPanelProps {
  names: string[]
  raceTime: number
  onUpdateName: (index: number, name: string) => void
  onRemoveParticipant: (index: number) => void
  onAddParticipant: () => void
  onUpdateRaceTime: (time: number) => void
  onUpdateShareUrl: () => void
}

export default function SettingsPanel({
  names,
  raceTime,
  onUpdateName,
  onRemoveParticipant,
  onAddParticipant,
  onUpdateRaceTime,
  onUpdateShareUrl,
}: SettingsPanelProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Race Settings</h2>

      {/* Race Time Slider - Changed step to 5 seconds */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Race Time: {raceTime} seconds</label>
        <Slider
          value={[raceTime]}
          min={5}
          max={300}
          step={5}
          onValueChange={(value) => onUpdateRaceTime(value[0])}
          className="mb-2"
        />
      </div>

      {/* Participant Names */}
      <div className="space-y-3 mb-6">
        <label className="block font-medium">Participants:</label>
        {names.map((name, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => onUpdateName(index, e.target.value)}
              className="flex-1"
              placeholder={`Participant ${index + 1}`}
            />
            <Button
              onClick={() => onRemoveParticipant(index)}
              variant="destructive"
              size="sm"
              disabled={names.length <= 1}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button onClick={onAddParticipant}>Add Participant</Button>
        <Button onClick={onUpdateShareUrl} variant="outline">
          Update Share Link
        </Button>
      </div>
    </div>
  )
}

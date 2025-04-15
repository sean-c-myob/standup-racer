"use client"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Settings } from "lucide-react"

interface RaceControlsProps {
  isRacing: boolean
  onStart: () => void
  onReset: () => void
  onToggleEdit: () => void
  isEditing: boolean
}

export default function RaceControls({ isRacing, onStart, onReset, onToggleEdit, isEditing }: RaceControlsProps) {
  return (
    <div className="flex justify-center gap-4 mb-8">
      <Button onClick={onStart} disabled={isRacing} className="flex items-center gap-2">
        <Play className="h-4 w-4" />
        Start Race
      </Button>
      <Button onClick={onReset} variant="outline" className="flex items-center gap-2">
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
      <Button onClick={onToggleEdit} variant="outline" className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        {isEditing ? "Done" : "Edit"}
      </Button>
    </div>
  )
}

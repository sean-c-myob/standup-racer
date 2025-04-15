"use client"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

interface WinnerModalProps {
  isOpen: boolean
  onClose: () => void
  winner: number | null
  names: string[]
  emojis: string[]
  onNewRace: () => void
}

export default function WinnerModal({ isOpen, onClose, winner, names, emojis, onNewRace }: WinnerModalProps) {
  // Add animation styles for faster appearance
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-150">
        <DialogTitle className="text-center text-2xl">🎉 We Have a Winner! 🎉</DialogTitle>
        <div className="flex flex-col items-center justify-center p-6 text-center">
          {winner !== null && (
            <>
              <div className="text-7xl mb-4 animate-bounce">{emojis[winner]}</div>
              <h2 className="text-3xl font-bold mb-2">{names[winner]}</h2>
              <p className="text-xl text-muted-foreground">Finished first!</p>
              <div className="mt-6 text-4xl rotate-12 animate-pulse">🏆</div>
            </>
          )}
        </div>
        <div className="flex justify-center mt-4">
          <Button onClick={onNewRace} className="w-full">
            Start New Race
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

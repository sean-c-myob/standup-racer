import { Suspense } from "react"
import EmojiRaceClient from "../components/emoji-race/emoji-race-client"

export default function EmojiRacePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Emoji Racer</h1>
      
      <Suspense fallback={<div className="text-center p-8">Loading race...</div>}>
        <EmojiRaceClient />
      </Suspense>
    </div>
  )
}

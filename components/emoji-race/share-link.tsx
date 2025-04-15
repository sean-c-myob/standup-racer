"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy } from "lucide-react"

interface ShareLinkProps {
  url: string
}

export default function ShareLink({ url }: ShareLinkProps) {
  const copyShareUrl = () => {
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-2">
      <Input value={url} readOnly className="flex-1" />
      <Button onClick={copyShareUrl} variant="outline" size="icon">
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  )
}

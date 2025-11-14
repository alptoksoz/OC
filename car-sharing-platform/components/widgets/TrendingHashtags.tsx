import Link from "next/link"
import { Hash } from "lucide-react"

interface TrendingHashtagsProps {
  hashtags: {
    tag: string
    count: number
  }[]
}

export default function TrendingHashtags({ hashtags }: TrendingHashtagsProps) {
  if (hashtags.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Hash className="w-5 h-5 text-blue-500" />
        Trending Hashtags
      </h2>
      <div className="space-y-3">
        {hashtags.map((item, index) => (
          <Link
            key={item.tag}
            href={`/hashtag/${encodeURIComponent(item.tag)}`}
            className="block hover:bg-gray-50 p-2 rounded transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-blue-500">#{item.tag}</p>
                <p className="text-xs text-gray-500">{item.count} post{item.count !== 1 ? "s" : ""}</p>
              </div>
              <span className="text-xl font-bold text-gray-300">#{index + 1}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

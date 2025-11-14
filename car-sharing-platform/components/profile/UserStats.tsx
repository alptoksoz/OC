import Link from "next/link"
import { Heart, MessageCircle, Eye, Hash } from "lucide-react"

interface UserStatsProps {
  totalLikes: number
  totalComments: number
  totalViews: number
  topHashtags: { tag: string; count: number }[]
}

export default function UserStats({
  totalLikes,
  totalComments,
  totalViews,
  topHashtags,
}: UserStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">Statistics</h2>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">{totalLikes}</p>
          <p className="text-sm text-gray-600">Total Likes</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{totalComments}</p>
          <p className="text-sm text-gray-600">Total Comments</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Eye className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{totalViews}</p>
          <p className="text-sm text-gray-600">Total Views</p>
        </div>
      </div>

      {/* Top Hashtags */}
      {topHashtags.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Most Used Hashtags
          </h3>
          <div className="space-y-2">
            {topHashtags.map((item) => (
              <Link
                key={item.tag}
                href={`/hashtag/${encodeURIComponent(item.tag)}`}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition"
              >
                <span className="text-blue-500 font-medium">#{item.tag}</span>
                <span className="text-gray-500 text-sm">{item.count} posts</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

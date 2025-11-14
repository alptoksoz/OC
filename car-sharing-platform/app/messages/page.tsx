"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import { MessageCircle, User as UserIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  lastMessageAt: string
  unreadCount: number
  otherUser: {
    id: string
    name: string | null
    username: string | null
    email: string
    image: string | null
  }
  messages: {
    content: string
    createdAt: string
  }[]
}

export default function MessagesPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations")
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Messages
        </h1>

        {conversations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No messages yet</p>
            <p className="text-gray-400">Start a conversation with someone!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg divide-y">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="block p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  {conversation.otherUser.image ? (
                    <img
                      src={conversation.otherUser.image}
                      alt={conversation.otherUser.name || "User"}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {conversation.otherUser.name?.[0] || conversation.otherUser.email[0]}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">
                        {conversation.otherUser.name || conversation.otherUser.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate ${
                          conversation.unreadCount > 0
                            ? "font-semibold text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {conversation.messages[0]?.content || "No messages"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

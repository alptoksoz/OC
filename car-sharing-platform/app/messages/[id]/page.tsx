"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import { ArrowLeft, Send, User as UserIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  read: boolean
}

interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string | null
    username: string | null
    email: string
    image: string | null
  }
  messages: Message[]
}

export default function ConversationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>("")

  useEffect(() => {
    fetchConversation()
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchConversation, 3000)
    return () => clearInterval(interval)
  }, [params.id])

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setConversation(data)
        // Set current user ID from first message if available
        if (data.messages.length > 0 && !currentUserId) {
          const firstMsg = data.messages[0]
          setCurrentUserId(
            firstMsg.senderId === data.otherUser.id ? firstMsg.receiverId : firstMsg.senderId
          )
        } else if (data.user1Id && data.otherUser.id !== data.user1Id) {
          setCurrentUserId(data.user1Id)
        } else if (data.user2Id) {
          setCurrentUserId(data.user2Id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !conversation) return

    setSending(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: params.id,
          receiverId: conversation.otherUser.id,
          content: newMessage,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        await fetchConversation()
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading conversation...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto py-8 px-4">
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">Conversation not found</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/messages" className="hover:bg-gray-100 p-2 rounded-full transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <Link
            href={`/profile/${conversation.otherUser.username || conversation.otherUser.email}`}
            className="flex items-center gap-3 flex-1"
          >
            {conversation.otherUser.image ? (
              <img
                src={conversation.otherUser.image}
                alt={conversation.otherUser.name || "User"}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {conversation.otherUser.name?.[0] || conversation.otherUser.email[0]}
              </div>
            )}
            <div>
              <p className="font-semibold">
                {conversation.otherUser.name || conversation.otherUser.username}
              </p>
              <p className="text-xs text-gray-500">
                @{conversation.otherUser.username || conversation.otherUser.email.split("@")[0]}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 overflow-y-auto">
        {conversation.messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversation.messages.map((message) => {
              const isOwnMessage = message.senderId !== conversation.otherUser.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOwnMessage
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

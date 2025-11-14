"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import { Heart, MessageCircle, UserPlus, User as UserIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: string
  read: boolean
  createdAt: string
  actor: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  } | null
  post: {
    id: string
    carBrand: string
    carModel: string
    images: string[]
  } | null
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    markAsRead()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
      })
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor?.name || notification.actor?.username || "Someone"

    switch (notification.type) {
      case "like":
        return `${actorName} liked your post`
      case "comment":
        return `${actorName} commented on your post`
      case "follow":
        return `${actorName} started following you`
      default:
        return "New notification"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />
      default:
        return <UserIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (notification.type === "follow") {
      return `/profile/${notification.actor?.username || notification.actor?.id}`
    }
    if (notification.postId) {
      return `/posts/${notification.postId}`
    }
    return "#"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg mb-2">No notifications yet</p>
            <p className="text-gray-400">
              When someone likes or comments on your posts, you'll see it here
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg divide-y">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={getNotificationLink(notification)}
                className={`block p-4 hover:bg-gray-50 transition ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {notification.actor?.image ? (
                        <img
                          src={notification.actor.image}
                          alt={notification.actor.name || "User"}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {getNotificationText(notification)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>

                    {notification.post && notification.post.images.length > 0 && (
                      <div className="mt-2">
                        <img
                          src={notification.post.images[0]}
                          alt={`${notification.post.carBrand} ${notification.post.carModel}`}
                          className="w-12 h-12 rounded object-cover"
                        />
                      </div>
                    )}
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

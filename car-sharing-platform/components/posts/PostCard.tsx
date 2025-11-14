"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Bookmark, Send, Trash2, Edit2, X, Share2, ChevronLeft, ChevronRight } from "lucide-react"
import { Post, Comment } from "@/types"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  post: Post
  currentUserId?: string
  initialIsSaved?: boolean
}

export default function PostCard({ post, currentUserId, initialIsSaved = false }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(
    post.likes?.some((like) => like.userId === currentUserId) || false
  )
  const [likesCount, setLikesCount] = useState(post._count?.likes || post.likes?.length || 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>(post.comments || [])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments()
    }
  }, [showComments])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: isLiked ? "DELETE" : "POST",
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          parentId: parentId || replyingTo,
        }),
      })

      if (response.ok) {
        const comment = await response.json()
        if (replyingTo) {
          // Add reply to parent comment
          await fetchComments()
        } else {
          setComments([comment, ...comments])
        }
        setNewComment("")
        setReplyingTo(null)
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/save`, {
        method: isSaved ? "DELETE" : "POST",
      })

      if (response.ok) {
        setIsSaved(!isSaved)
      }
    } catch (error) {
      console.error("Error saving post:", error)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${post.id}`
    try {
      await navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    } catch (error) {
      console.error("Error copying link:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentId))
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href={`/profile/${post.user.username}`} className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {post.user.name?.[0] || post.user.email[0]}
          </div>
          <div>
            <p className="font-semibold text-sm">{post.user.name || post.user.username}</p>
            <p className="text-xs text-gray-500">
              {post.carYear} {post.carBrand} {post.carModel}
            </p>
          </div>
        </Link>
        {post.userId === currentUserId && (
          <div className="flex items-center space-x-2">
            <Link
              href={`/posts/${post.id}/edit`}
              className="text-gray-400 hover:text-blue-500 transition"
              title="Edit post"
            >
              <Edit2 className="w-5 h-5" />
            </Link>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 transition"
              title="Delete post"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Images Carousel */}
      {post.images && post.images.length > 0 && (
        <div className="relative w-full aspect-square bg-gray-100 group">
          <Image
            src={post.images[currentImageIndex]}
            alt={`${post.carBrand} ${post.carModel}`}
            fill
            className="object-cover"
          />

          {/* Image navigation */}
          {post.images.length > 1 && (
            <>
              {/* Previous button */}
              {currentImageIndex > 0 && (
                <button
                  onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next button */}
              {currentImageIndex < post.images.length - 1 && (
                <button
                  onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full transition ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`transition ${isLiked ? "text-red-500" : "text-gray-700 hover:text-red-500"}`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-gray-700 hover:text-blue-500 transition"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button
              onClick={handleShare}
              className="text-gray-700 hover:text-green-500 transition"
              title="Share"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={handleSave}
            className={`transition ${isSaved ? "text-blue-500" : "text-gray-700 hover:text-blue-500"}`}
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Likes and views count */}
        <div className="flex items-center gap-4">
          <p className="font-semibold text-sm">{likesCount} likes</p>
          {post.viewsCount !== undefined && post.viewsCount > 0 && (
            <p className="text-sm text-gray-500">{post.viewsCount} views</p>
          )}
        </div>

        {/* Caption */}
        <div>
          <p className="text-sm">
            <Link href={`/profile/${post.user.username}`} className="font-semibold mr-2">
              {post.user.name || post.user.username}
            </Link>
            {post.description}
          </p>
          {post.hashtags && post.hashtags.length > 0 && (
            <p className="text-sm mt-1">
              {post.hashtags.map((tag, index) => (
                <Link
                  key={index}
                  href={`/hashtag/${encodeURIComponent(tag)}`}
                  className="text-blue-500 hover:underline mr-2"
                >
                  #{tag}
                </Link>
              ))}
            </p>
          )}
        </div>

        {/* Comments count */}
        {(comments.length > 0 || post._count?.comments || 0) > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showComments ? "Hide" : "View all"} {comments.length || post._count?.comments || post.comments?.length} comments
          </button>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="space-y-3 border-t pt-3">
            {/* Comment list */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  {/* Main comment */}
                  <div className="flex space-x-2 group">
                    <Link href={`/profile/${comment.user.username}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {comment.user.name?.[0] || comment.user.email[0]}
                      </div>
                    </Link>
                    <div className="flex-1">
                      <p className="text-sm">
                        <Link href={`/profile/${comment.user.username}`} className="font-semibold mr-2">
                          {comment.user.name || comment.user.username}
                        </Link>
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                        <button
                          onClick={() => setReplyingTo(comment.id)}
                          className="text-xs text-gray-500 hover:text-blue-500 font-semibold"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                    {comment.user.id === currentUserId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                        title="Delete comment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Nested replies */}
                  {(comment as any).replies && (comment as any).replies.length > 0 && (
                    <div className="ml-10 space-y-2">
                      {(comment as any).replies.map((reply: any) => (
                        <div key={reply.id} className="flex space-x-2 group">
                          <Link href={`/profile/${reply.user.username}`}>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {reply.user.name?.[0] || reply.user.email?.[0] || "U"}
                            </div>
                          </Link>
                          <div className="flex-1">
                            <p className="text-sm">
                              <Link href={`/profile/${reply.user.username}`} className="font-semibold mr-2">
                                {reply.user.name || reply.user.username}
                              </Link>
                              {reply.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          {reply.user.id === currentUserId && (
                            <button
                              onClick={() => handleDeleteComment(reply.id)}
                              className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                              title="Delete reply"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply form */}
                  {replyingTo === comment.id && (
                    <div className="ml-10">
                      <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder={`Reply to ${comment.user.name || comment.user.username}...`}
                          className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || !newComment.trim()}
                          className="text-blue-500 hover:text-blue-600 disabled:text-gray-300"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add comment form */}
            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 border-t pt-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-sm border-none outline-none focus:ring-0"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="text-blue-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Time */}
        <p className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}

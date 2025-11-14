"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreatePostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    carBrand: "",
    carModel: "",
    carYear: new Date().getFullYear(),
    description: "",
    images: "",
    hashtags: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Parse images and hashtags
      const images = formData.images
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url)

      const hashtags = formData.hashtags
        .split(",")
        .map((tag) => tag.trim().replace("#", ""))
        .filter((tag) => tag)

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carBrand: formData.carBrand,
          carModel: formData.carModel,
          carYear: parseInt(formData.carYear.toString()),
          description: formData.description,
          images,
          hashtags,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create post")
      }

      router.push("/")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Feed
          </Link>

          <h1 className="text-2xl font-bold mb-6">Share Your Car</h1>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="carBrand" className="block text-sm font-medium mb-2">
                  Brand *
                </label>
                <input
                  id="carBrand"
                  name="carBrand"
                  type="text"
                  value={formData.carBrand}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Mercedes-Benz"
                />
              </div>

              <div>
                <label htmlFor="carModel" className="block text-sm font-medium mb-2">
                  Model *
                </label>
                <input
                  id="carModel"
                  name="carModel"
                  type="text"
                  value={formData.carModel}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., C-Class"
                />
              </div>
            </div>

            <div>
              <label htmlFor="carYear" className="block text-sm font-medium mb-2">
                Year *
              </label>
              <input
                id="carYear"
                name="carYear"
                type="number"
                value={formData.carYear}
                onChange={handleChange}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Tell us about your car..."
              />
            </div>

            <div>
              <label htmlFor="images" className="block text-sm font-medium mb-2">
                Image URLs (comma separated)
              </label>
              <input
                id="images"
                name="images"
                type="text"
                value={formData.images}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter image URLs separated by commas
              </p>
            </div>

            <div>
              <label htmlFor="hashtags" className="block text-sm font-medium mb-2">
                Hashtags (comma separated)
              </label>
              <input
                id="hashtags"
                name="hashtags"
                type="text"
                value={formData.hashtags}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="luxury, sedan, classic"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Creating..." : "Share Post"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

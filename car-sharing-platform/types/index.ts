export interface User {
  id: string
  name: string | null
  email: string
  username: string | null
  image: string | null
  bio: string | null
  createdAt: Date
}

export interface Post {
  id: string
  userId: string
  carBrand: string
  carModel: string
  carYear: number
  description: string | null
  images: string[]
  hashtags: string[]
  createdAt: Date
  updatedAt: Date
  user: User
  likes: Like[]
  comments: Comment[]
  _count?: {
    likes: number
    comments: number
  }
}

export interface Like {
  id: string
  userId: string
  postId: string
  createdAt: Date
  user?: User
}

export interface Comment {
  id: string
  userId: string
  postId: string
  content: string
  createdAt: Date
  user: User
}

export interface Follow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}

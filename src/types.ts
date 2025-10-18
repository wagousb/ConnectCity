export interface User {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  followers?: number;
  following?: number;
  bannerUrl?: string;
  bio?: string;
  date_of_birth?: string;
  is_public?: boolean;
  notifications_on_likes?: boolean;
  notifications_on_comments?: boolean;
  notifications_on_new_followers?: boolean;
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  saved?: boolean;
}

export interface Suggestion {
  id:string;
  user: User;
}

export interface Trend {
  id: string;
  hashtag: string;
  postCount: string;
}

export interface ConnectionRequest {
  id: string;
  user: User;
  mutuals: number;
}
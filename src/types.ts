export interface User {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio?: string;
  date_of_birth?: string;
  is_public?: boolean;
  notifications_on_likes?: boolean;
  notifications_on_comments?: boolean;
  notifications_on_new_followers?: boolean;
}

export interface Post {
  id: string;
  author: User;
  title: string;
  target_entity: string;
  content: string;
  imageUrl?: string;
  document_url?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  saved?: boolean;
  isLiked?: boolean;
  average_rating?: number;
  user_rating?: number;
  total_votes?: number;
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

export interface Notification {
  id: string;
  type: 'like' | 'comment';
  actor: User;
  is_read: boolean;
  created_at: string;
  entity_id?: string; // e.g., post_id
}
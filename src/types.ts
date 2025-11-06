export interface Profile {
  id: string;
  name: string;
  handle: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  date_of_birth?: string;
  is_public?: boolean;
  notifications_on_likes?: boolean;
  notifications_on_comments?: boolean;
  notifications_on_new_followers?: boolean;
  notifications_on_implemented_projects?: boolean;
  role: string;
  is_moderator?: boolean;
}

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
  notifications_on_implemented_projects?: boolean;
  role: string;
  is_moderator?: boolean;
}

export interface Post {
  id: string;
  type: 'idea' | 'announcement' | 'speech'; // Novo campo
  author: User;
  title: string;
  target_entity?: string | null;
  content: string;
  imageUrl?: string;
  document_url?: string;
  timestamp: string;
  comments: number;
  shares: number;
  average_rating?: number;
  user_rating?: number;
  total_votes?: number;
  start_date?: string;
  end_date?: string;
  project_status?: 'Não iniciado' | 'Em andamento' | 'Concluído';
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  created_at: string;
  replies: Comment[];
  agree_count: number;
  disagree_count: number;
  user_vote?: 'agree' | 'disagree' | null;
  post_id: string;
  parent_comment_id?: string | null;
  is_deleted?: boolean;
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
  type: 'comment' | 'rating' | 'reply' | 'comment_agree' | 'comment_disagree' | 'announcement' | 'speech';
  actor: User;
  is_read: boolean;
  created_at: string;
  entity_id?: string; // e.g., post_id
  postTitle?: string;
  comment_id?: string;
  commentContent?: string;
}

export interface Report {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
  
  // Dados populados via join/fetch
  post_title: string;
  reporter_handle: string;
}
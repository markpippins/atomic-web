export type User = {
  id: string;
  name: string;
  username: string;
  avatar: string; 
  bio: string;
};

export type Post = {
  id: string;
  user: User;
  content: string;
  tags: string[];
  createdAt: string; // ISO string
  likes: number;
  comments: number;
};

export type Forum = {
  id: string;
  slug: string;
  name: string;
  description: string;
  threadCount: number;
  postCount: number;
  image: string; // Corresponds to an ID in placeholder-images.json
};

export type ForumThread = {
  id: string;
  forumSlug: string;
  title: string;
  author: User;
  createdAt: string; // ISO string
  replyCount: number;
  viewCount: number;
  lastReply: {
    user: User;
    createdAt: string;
  } | null;
};

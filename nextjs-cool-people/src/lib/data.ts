import type { User, Post, Forum, ForumThread } from './types';
import { subDays, subHours, subMinutes } from 'date-fns';

export const users: User[] = [
  { id: 'user-1', name: 'Jeff', username: 'jeff', avatar: 'avatar1', bio: 'Frontend developer and UI/UX enthusiast.' },
  { id: 'user-2', name: 'Bob', username: 'bob', avatar: 'avatar2', bio: 'Backend engineer, loves system design.' },
  { id: 'user-3', name: 'Charlie', username: 'charlie', avatar: 'avatar3', bio: 'AI researcher exploring the future.' },
  { id: 'user-4', name: 'Diana', username: 'diana', avatar: 'avatar4', bio: 'Full-stack dev and avid coffee drinker.' },
];

export const posts: Post[] = [
  {
    id: 'post-1',
    user: users[0],
    content: 'Just launched a new Next.js project with shadcn/ui and it feels amazing! The DX is top-notch. Highly recommend for anyone starting a new app.',
    tags: ['nextjs', 'react', 'development', 'webdev'],
    createdAt: subMinutes(new Date(), 5).toISOString(),
    likes: 12,
    comments: 3,
  },
  {
    id: 'post-2',
    user: users[2],
    content: 'Exploring the new features in Genkit for AI-powered applications. The ability to define flows and prompts declaratively simplifies development significantly.',
    tags: ['ai', 'genkit', 'firebase', 'typescript'],
    createdAt: subHours(new Date(), 2).toISOString(),
    likes: 42,
    comments: 8,
  },
  {
    id: 'post-3',
    user: users[1],
    content: 'Thinking about database choices for a new social media app. What are your thoughts on Firestore vs. a traditional SQL database? Performance at scale is a key concern.',
    tags: ['database', 'firestore', 'sql', 'backend'],
    createdAt: subDays(new Date(), 1).toISOString(),
    likes: 78,
    comments: 21,
  },
  {
    id: 'post-4',
    user: users[3],
    content: 'The new responsive design on our company website is finally live! It was a team effort and I am so proud of what we accomplished. Check it out and let me know your thoughts!',
    tags: ['webdesign', 'responsive', 'css', 'frontend'],
    createdAt: subDays(new Date(), 2).toISOString(),
    likes: 55,
    comments: 12,
  },
];

export const forums: Forum[] = [
  {
    id: 'forum-1',
    slug: 'general-discussion',
    name: 'General Discussion',
    description: 'A place for anything and everything.',
    threadCount: 120,
    postCount: 1500,
    image: 'forum_general',
  },
  {
    id: 'forum-2',
    slug: 'web-development',
    name: 'Web Development',
    description: 'Discuss frameworks, libraries, and best practices.',
    threadCount: 450,
    postCount: 8900,
    image: 'forum_webdev',
  },
  {
    id: 'forum-3',
    slug: 'ai-machine-learning',
    name: 'AI & Machine Learning',
    description: 'The latest in AI, ML, and data science.',
    threadCount: 310,
    postCount: 6200,
    image: 'forum_ai',
  },
  {
    id: 'forum-4',
    slug: 'design-ux',
    name: 'Design & UX',
    description: 'Share your designs and get feedback.',
    threadCount: 205,
    postCount: 3400,
    image: 'forum_design',
  },
];

export const threads: ForumThread[] = [
  {
    id: 'thread-1',
    forumSlug: 'web-development',
    title: 'What\'s everyone\'s favorite CSS framework in 2024?',
    author: users[0],
    createdAt: subDays(new Date(), 1).toISOString(),
    replyCount: 15,
    viewCount: 250,
    lastReply: {
      user: users[3],
      createdAt: subHours(new Date(), 2).toISOString(),
    }
  },
  {
    id: 'thread-2',
    forumSlug: 'web-development',
    title: 'Server components in Next.js: Best practices?',
    author: users[1],
    createdAt: subDays(new Date(), 2).toISOString(),
    replyCount: 8,
    viewCount: 180,
    lastReply: {
      user: users[0],
      createdAt: subHours(new Date(), 5).toISOString(),
    }
  },
  {
    id: 'thread-3',
    forumSlug: 'ai-machine-learning',
    title: 'How to get started with Genkit?',
    author: users[2],
    createdAt: subHours(new Date(), 10).toISOString(),
    replyCount: 4,
    viewCount: 95,
    lastReply: {
      user: users[2],
      createdAt: subMinutes(new Date(), 45).toISOString(),
    }
  },
];

// Mock API functions
export const getPosts = async (): Promise<Post[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getForums = async (): Promise<Forum[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return forums;
}

export const getForumBySlug = async (slug: string): Promise<Forum | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return forums.find(f => f.slug === slug);
}

export const getThreadsByForumSlug = async (slug: string): Promise<ForumThread[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return threads
    .filter(t => t.forumSlug === slug)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const getUserByUsername = async (username: string): Promise<User | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return users.find(u => u.username === username);
}

export const getPostsByUserId = async (userId: string): Promise<Post[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return posts
    .filter(p => p.user.id === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

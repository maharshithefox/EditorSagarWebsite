export type VideoCategory =
  | 'Showreels & Promos'
  | 'Wedding & Pre-wedding'
  | 'Corporate'
  | 'Housewarming & Maternity'
  | 'DJ Night'
  | 'Editing Samples';

export interface VideoItem {
  id: string;
  title: string;
  category: VideoCategory;
  description: string;
  thumbnail: string;
  videoUrl: string; // Direct streamable MP4 URL (e.g. from Pexels)
  duration: string;
  clientName: string;
  location: string;
  date: string;
  fcpTags: string[]; // Final Cut Pro features used, e.g. ["Multicam", "Optical Flow", "Color Grading"]
  isFeatured?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  category: string;
}

export interface GitHubUser {
  id: number;
  username: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  htmlUrl: string;
  publicGists: number;
}


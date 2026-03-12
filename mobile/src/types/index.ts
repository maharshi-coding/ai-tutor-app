export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  avatar_photo_path?: string;
  voice_sample_path?: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  subject: string;
  difficulty_level: string;
  created_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  videoUrl?: string;
}

export interface TutorResponse {
  response: string;
  suggestions?: string[];
}

export interface AvatarJob {
  job_id: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  video_url?: string;
  error?: string;
}

export interface AvatarConfig {
  has_photo: boolean;
  has_voice: boolean;
  photo_path?: string;
  voice_path?: string;
  character_image_url?: string;
  last_generated_clip_url?: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Chat: {courseId?: number; courseName?: string} | undefined;
  Avatar: undefined;
  Profile: undefined;
};

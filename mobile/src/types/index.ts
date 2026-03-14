import {NavigatorScreenParams} from '@react-navigation/native';

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
  isStreaming?: boolean;
}

export interface TutorResponse {
  response: string;
  suggestions?: string[];
}

export interface TutorHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskTutorResponse extends TutorResponse {
  course_id?: number;
  course_title?: string;
}

export interface AvatarCreateResponse {
  avatar_id: string;
  avatar_provider: string;
  avatar_image_url?: string;
  cached: boolean;
  message: string;
}

export interface AvatarJob {
  job_id: string;
  avatar_id?: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  video_url?: string;
  error?: string;
}

export interface AvatarConfig {
  has_photo: boolean;
  has_voice: boolean;
  photo_path?: string;
  voice_path?: string;
  avatar_id?: string;
  avatar_ready?: boolean;
  avatar_provider?: string;
  avatar_image_url?: string;
  character_image_url?: string;
  last_generated_clip_url?: string;
  last_script?: string;
  daily_video_url?: string;
  daily_video_title?: string;
  daily_video_summary?: string;
  daily_video_highlights?: string[];
  daily_video_source_urls?: string[];
  daily_video_status?: 'idle' | 'pending' | 'processing' | 'done' | 'failed';
  daily_video_generated_at?: string;
  daily_video_error?: string;
}

export interface DailyVideoStatus {
  avatar_ready: boolean;
  avatar_id?: string;
  avatar_image_url?: string;
  status: 'idle' | 'pending' | 'processing' | 'done' | 'failed';
  job_id?: string;
  title?: string;
  summary?: string;
  highlights: string[];
  source_urls: string[];
  video_url?: string;
  generated_at?: string;
  error?: string;
}

export type TutorMode = 'chat' | 'liveTutor';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type TutorStackParamList = {
  AvatarTutor: {courseId?: number; courseName?: string} | undefined;
  AvatarSetup: undefined;
  CourseSelection: {autoStart?: boolean; mode?: TutorMode} | undefined;
  TutorChat:
    | {courseId?: number; courseName?: string; mode?: TutorMode}
    | undefined;
  AvatarVideoPlayer: {videoUrl: string; title?: string};
};

export type MainTabParamList = {
  Home: undefined;
  Chat: NavigatorScreenParams<TutorStackParamList> | undefined;
  Avatar: undefined;
  Profile: undefined;
};

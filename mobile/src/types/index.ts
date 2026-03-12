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
}

export interface TutorResponse {
  response: string;
  suggestions?: string[];
}

export interface AskTutorResponse extends TutorResponse {
  course_id?: number;
  course_title?: string;
  audio_url?: string;
  audio_duration_ms?: number;
  avatar_job_id?: string;
  avatar_status?: 'pending' | 'processing' | 'done' | 'failed';
  avatar_video_url?: string;
  media_errors?: string[];
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
  last_script?: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type TutorStackParamList = {
  AvatarTutor: {courseId?: number; courseName?: string} | undefined;
  CourseSelection: {autoStart?: boolean} | undefined;
  TutorChat: {courseId?: number; courseName?: string} | undefined;
  AvatarVideoPlayer: {videoUrl: string; title?: string};
};

export type MainTabParamList = {
  Home: undefined;
  Chat: NavigatorScreenParams<TutorStackParamList> | undefined;
  Avatar: undefined;
  Profile: undefined;
};

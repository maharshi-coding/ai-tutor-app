import AsyncStorage from '@react-native-async-storage/async-storage';
import {Message} from '../types';

const STORAGE_PREFIX = 'chat_session_v1';
const MAX_STORED_MESSAGES = 80;

type StoredMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  videoUrl?: string;
};

export function buildChatSessionStorageKey(
  userId?: number | null,
  courseId?: number,
): string {
  const userSegment = userId ?? 'anon';
  const courseSegment = courseId ?? 'general';
  return `${STORAGE_PREFIX}:user:${userSegment}:course:${courseSegment}`;
}

function toStoredMessage(message: Message): StoredMessage | null {
  const content = message.content.trim();

  if (!content && !message.videoUrl) {
    return null;
  }

  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp.toISOString(),
    videoUrl: message.videoUrl,
  };
}

export async function loadChatSession(
  userId?: number | null,
  courseId?: number,
): Promise<Message[]> {
  const raw = await AsyncStorage.getItem(
    buildChatSessionStorageKey(userId, courseId),
  );

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as StoredMessage[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        item =>
          item &&
          (item.role === 'user' || item.role === 'assistant') &&
          typeof item.content === 'string' &&
          typeof item.timestamp === 'string',
      )
      .map(item => ({
        id: item.id,
        role: item.role,
        content: item.content,
        timestamp: new Date(item.timestamp),
        videoUrl: item.videoUrl,
      }));
  } catch {
    await AsyncStorage.removeItem(buildChatSessionStorageKey(userId, courseId));
    return [];
  }
}

export async function saveChatSession(
  userId: number | null | undefined,
  courseId: number | undefined,
  messages: Message[],
): Promise<void> {
  const payload = messages
    .map(toStoredMessage)
    .filter((item): item is StoredMessage => item !== null)
    .slice(-MAX_STORED_MESSAGES);

  await AsyncStorage.setItem(
    buildChatSessionStorageKey(userId, courseId),
    JSON.stringify(payload),
  );
}

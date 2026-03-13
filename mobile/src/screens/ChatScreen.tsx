import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Video from 'react-native-video';
import MarkdownMessage from '../components/MarkdownMessage';
import NoticeBanner from '../components/NoticeBanner';
import {
  avatarAPI,
  extractErrorMessage,
  getApiBaseUrl,
  tutorAPI,
  uploadAPI,
} from '../services/api';
import {
  buildChatSessionStorageKey,
  loadChatSession,
  saveChatSession,
} from '../services/chatSessionStorage';
import {pollAvatarJob} from '../services/avatarService';
import {useAuthStore} from '../store/authStore';
import {
  AvatarConfig,
  Message,
  TutorHistoryMessage,
  TutorMode,
  TutorStackParamList,
} from '../types';

type ChatRoute = RouteProp<TutorStackParamList, 'TutorChat'>;
type ChatNav = NativeStackNavigationProp<TutorStackParamList, 'TutorChat'>;

const MAX_HISTORY_MESSAGES = 12;
const STREAM_DELAY_MS = 20;
const AUTO_SCROLL_THRESHOLD = 180;

let messageCounter = 0;
const nextId = () => `msg-${++messageCounter}`;

async function toAbsUrl(url: string): Promise<string> {
  if (url.startsWith('http')) {
    return url;
  }

  const baseUrl = await getApiBaseUrl();
  return `${baseUrl}${url}`;
}

function starterSuggestions(courseName: string, hasCourse: boolean): string[] {
  return hasCourse
    ? [
        `Give me a beginner-friendly overview of ${courseName}.`,
        `Show me one practical ${courseName} example.`,
        `Create a short practice exercise for ${courseName}.`,
      ]
    : [
        'Teach me a topic step by step.',
        'Show me one practical example.',
        'Quiz me with one practice question.',
      ];
}

function buildHistory(messages: Message[]): TutorHistoryMessage[] {
  return messages
    .filter(message => message.content.trim().length > 0)
    .map(message => ({role: message.role, content: message.content.trim()}))
    .slice(-MAX_HISTORY_MESSAGES);
}

function cleanSuggestions(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter(
      (item: unknown): item is string =>
        typeof item === 'string' && item.trim().length > 0,
    )
    .slice(0, 3);
}

function nextStreamIndex(currentIndex: number, fullText: string): number {
  const chunkSize =
    fullText.length > 1600 ? 70 : fullText.length > 900 ? 48 : 28;
  return Math.min(currentIndex + chunkSize, fullText.length);
}

export default function ChatScreen() {
  const navigation = useNavigation<ChatNav>();
  const route = useRoute<ChatRoute>();
  const userId = useAuthStore(state => state.user?.id);
  const courseId = route.params?.courseId;
  const courseName = route.params?.courseName ?? 'General AI Tutor';
  const mode: TutorMode = route.params?.mode ?? 'chat';
  const isLiveTutor = mode === 'liveTutor';
  const sessionKey = useMemo(
    () => buildChatSessionStorageKey(userId, courseId),
    [courseId, userId],
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState('');
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null);

  const listRef = useRef<FlatList<Message>>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const streamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const isNearBottomRef = useRef(true);
  const sessionKeyRef = useRef(sessionKey);
  const latestAvatarTokenRef = useRef<string | null>(null);

  const isBusy = isWaitingForResponse || !!streamingMessageId;
  const visibleSuggestions =
    suggestions.length > 0
      ? suggestions
      : messages.length === 0
        ? starterSuggestions(courseName, !!courseId)
        : [];

  const clearStreamTimer = useCallback(() => {
    if (streamTimerRef.current) {
      clearTimeout(streamTimerRef.current);
      streamTimerRef.current = null;
    }
  }, []);

  const maybeScrollToBottom = useCallback(
    (animated = true, force = false) => {
      setTimeout(() => {
        if (!isMountedRef.current) {
          return;
        }

        if (force || isNearBottomRef.current) {
          listRef.current?.scrollToEnd({animated});
        }
      }, 70);
    },
    [],
  );

  const loadAvatarState = useCallback(async () => {
    if (!isLiveTutor) {
      setAvatarConfig(null);
      setAvatarPreviewUrl(null);
      setHeroVideoUrl(null);
      return;
    }

    try {
      const response = await uploadAPI.getAvatarConfig();
      const config = response.data as AvatarConfig;
      setAvatarConfig(config);
      const preview =
        config.avatar_image_url || config.character_image_url || config.photo_path;
      setAvatarPreviewUrl(preview ? await toAbsUrl(preview) : null);
      if (config.last_generated_clip_url) {
        setHeroVideoUrl(await toAbsUrl(config.last_generated_clip_url));
      } else {
        setHeroVideoUrl(null);
      }
    } catch (error) {
      setChatError(
        extractErrorMessage(
          error,
          'Could not load the current avatar tutor state.',
        ),
      );
    }
  }, [isLiveTutor]);

  useEffect(() => {
    sessionKeyRef.current = sessionKey;
  }, [sessionKey]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      pulseLoop.current?.stop();
      clearStreamTimer();
    };
  }, [clearStreamTimer]);

  useEffect(() => {
    const shouldPulse = isBusy || isGeneratingAvatar || isSessionLoading;

    if (shouldPulse) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
  }, [isBusy, isGeneratingAvatar, isSessionLoading, pulseAnim]);

  useEffect(() => {
    loadAvatarState().catch(() => {});
  }, [loadAvatarState]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAvatarState().catch(() => {});
    });
    return unsubscribe;
  }, [loadAvatarState, navigation]);

  useEffect(() => {
    let cancelled = false;

    setSessionReady(false);
    setIsSessionLoading(true);
    setMessages([]);
    setSuggestions([]);
    setInput('');
    setChatError(null);
    setIsWaitingForResponse(false);
    setStreamingMessageId(null);
    setIsGeneratingAvatar(false);
    setAvatarStatus('');
    latestAvatarTokenRef.current = null;
    clearStreamTimer();

    loadChatSession(userId, courseId)
      .then(storedMessages => {
        if (!cancelled && isMountedRef.current) {
          setMessages(storedMessages);
        }
      })
      .catch(() => {
        if (!cancelled && isMountedRef.current) {
          setChatError(
            'Could not restore the saved chat for this course. A fresh session is ready.',
          );
        }
      })
      .finally(() => {
        if (!cancelled && isMountedRef.current) {
          setIsSessionLoading(false);
          setSessionReady(true);
          maybeScrollToBottom(false, true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clearStreamTimer, courseId, maybeScrollToBottom, userId]);

  useEffect(() => {
    if (!sessionReady) {
      return;
    }

    const persistTimer = setTimeout(() => {
      saveChatSession(userId, courseId, messages).catch(() => {});
    }, 250);

    return () => clearTimeout(persistTimer);
  }, [courseId, messages, sessionReady, userId]);

  const openFullVideo = useCallback(
    (videoUrl: string) => {
      navigation.navigate('AvatarVideoPlayer', {
        videoUrl,
        title: courseName,
      });
    },
    [courseName, navigation],
  );

  const startAvatarPolling = useCallback(
    async (jobId: string, messageId: string, expectedSessionKey: string) => {
      const token = `${messageId}-${Date.now()}`;
      latestAvatarTokenRef.current = token;
      setIsGeneratingAvatar(true);
      setAvatarStatus('Preparing tutor video...');

      try {
        const videoUrl = await pollAvatarJob(jobId, status => {
          if (
            !isMountedRef.current ||
            latestAvatarTokenRef.current !== token ||
            sessionKeyRef.current !== expectedSessionKey
          ) {
            return;
          }

          setAvatarStatus(status);
        });

        if (
          !isMountedRef.current ||
          latestAvatarTokenRef.current !== token ||
          sessionKeyRef.current !== expectedSessionKey
        ) {
          return;
        }

        const fullUrl = await toAbsUrl(videoUrl);
        setHeroVideoUrl(fullUrl);
        setMessages(current =>
          current.map(message =>
            message.id === messageId ? {...message, videoUrl: fullUrl} : message,
          ),
        );
      } catch (error) {
        if (
          isMountedRef.current &&
          latestAvatarTokenRef.current === token &&
          sessionKeyRef.current === expectedSessionKey
        ) {
          setChatError(
            extractErrorMessage(
              error,
              'The tutor reply was generated, but the video response could not be finished.',
            ),
          );
        }
      } finally {
        if (
          isMountedRef.current &&
          latestAvatarTokenRef.current === token &&
          sessionKeyRef.current === expectedSessionKey
        ) {
          setIsGeneratingAvatar(false);
          setAvatarStatus('');
        }
      }
    },
    [],
  );

  const streamAssistantMessage = useCallback(
    async (
      messageId: string,
      fullText: string,
      expectedSessionKey: string,
    ): Promise<void> => {
      clearStreamTimer();
      let currentIndex = 0;

      return new Promise(resolve => {
        const pushNextChunk = () => {
          if (
            !isMountedRef.current ||
            sessionKeyRef.current !== expectedSessionKey
          ) {
            resolve();
            return;
          }

          currentIndex = nextStreamIndex(currentIndex, fullText);
          const nextContent = fullText.slice(0, currentIndex);

          setMessages(current =>
            current.map(message =>
              message.id === messageId
                ? {
                    ...message,
                    content: nextContent,
                    isStreaming: currentIndex < fullText.length,
                  }
                : message,
            ),
          );
          maybeScrollToBottom(true);

          if (currentIndex >= fullText.length) {
            setStreamingMessageId(current => (current === messageId ? null : current));
            resolve();
            return;
          }

          streamTimerRef.current = setTimeout(pushNextChunk, STREAM_DELAY_MS);
        };

        pushNextChunk();
      });
    },
    [clearStreamTimer, maybeScrollToBottom],
  );

  const generateAvatarReply = useCallback(
    async (
      assistantResponse: string,
      assistantMessageId: string,
      expectedSessionKey: string,
    ) => {
      if (!isLiveTutor) {
        return;
      }

      const currentAvatarId =
        avatarConfig?.avatar_ready && avatarConfig.avatar_id
          ? avatarConfig.avatar_id
          : null;

      if (!currentAvatarId) {
        if (sessionKeyRef.current === expectedSessionKey) {
          setChatError(
            'Live Tutor needs a D-ID avatar first. Open Avatar Setup, upload a photo, and try again.',
          );
        }
        return;
      }

      setIsGeneratingAvatar(true);
      setAvatarStatus('Sending explanation to D-ID...');

      try {
        const speakResponse = await avatarAPI.speak({
          avatarId: currentAvatarId,
          text: assistantResponse,
        });

        if (
          !isMountedRef.current ||
          sessionKeyRef.current !== expectedSessionKey
        ) {
          return;
        }

        const videoUrl = speakResponse.data?.video_url;
        if (videoUrl) {
          const fullUrl = await toAbsUrl(videoUrl);
          setHeroVideoUrl(fullUrl);
          setMessages(current =>
            current.map(message =>
              message.id === assistantMessageId
                ? {...message, videoUrl: fullUrl}
                : message,
            ),
          );
          setIsGeneratingAvatar(false);
          setAvatarStatus('');
        } else if (speakResponse.data?.job_id) {
          await startAvatarPolling(
            speakResponse.data.job_id,
            assistantMessageId,
            expectedSessionKey,
          );
        } else {
          setIsGeneratingAvatar(false);
          setAvatarStatus('');
          setChatError('Live Tutor did not return a video job id.');
        }
      } catch (error) {
        if (
          !isMountedRef.current ||
          sessionKeyRef.current !== expectedSessionKey
        ) {
          return;
        }

        setIsGeneratingAvatar(false);
        setAvatarStatus('');
        setChatError(
          extractErrorMessage(
            error,
            'The text answer is ready, but the tutor video could not be created.',
          ),
        );
      }
    },
    [avatarConfig, isLiveTutor, startAvatarPolling],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();

      if (!trimmed || isBusy || isSessionLoading) {
        return;
      }

      const requestHistory = buildHistory(messages);
      const activeSessionKey = sessionKey;
      const userMessage: Message = {
        id: nextId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };
      const assistantMessageId = nextId();
      const placeholder: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages(current => [...current, userMessage, placeholder]);
      setInput('');
      setSuggestions([]);
      setChatError(null);
      setIsWaitingForResponse(true);
      maybeScrollToBottom(true, true);

      try {
        const response = await tutorAPI.askTutor({
          message: trimmed,
          courseId,
          history: requestHistory,
        });

        if (
          !isMountedRef.current ||
          sessionKeyRef.current !== activeSessionKey
        ) {
          return;
        }

        const assistantResponse =
          typeof response.data?.response === 'string' &&
          response.data.response.trim()
            ? response.data.response.trim()
            : 'I could not generate a response just now.';

        setSuggestions(cleanSuggestions(response.data?.suggestions));
        setIsWaitingForResponse(false);
        setStreamingMessageId(assistantMessageId);

        const streamPromise = streamAssistantMessage(
          assistantMessageId,
          assistantResponse,
          activeSessionKey,
        );

        if (isLiveTutor) {
          generateAvatarReply(
            assistantResponse,
            assistantMessageId,
            activeSessionKey,
          ).catch(() => {});
        }

        await streamPromise;
      } catch (error) {
        if (
          !isMountedRef.current ||
          sessionKeyRef.current !== activeSessionKey
        ) {
          return;
        }

        setMessages(current =>
          current.filter(message => message.id !== assistantMessageId),
        );
        setIsWaitingForResponse(false);
        setStreamingMessageId(null);
        setIsGeneratingAvatar(false);
        setAvatarStatus('');
        setChatError(
          extractErrorMessage(
            error,
            'Failed to get a response. Check your connection.',
          ),
        );
      }
    },
    [
      courseId,
      generateAvatarReply,
      isBusy,
      isLiveTutor,
      isSessionLoading,
      maybeScrollToBottom,
      messages,
      sessionKey,
      streamAssistantMessage,
    ],
  );

  const renderMessage = useCallback(
    ({item}: {item: Message}) => {
      const isUser = item.role === 'user';
      const hasBody = item.content.trim().length > 0;

      return (
        <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}>
          {!isUser && <View style={styles.botDot} />}
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
            {isUser ? (
              <Text style={[styles.msgText, styles.msgTextUser]}>{item.content}</Text>
            ) : hasBody ? (
              <MarkdownMessage content={item.content} />
            ) : (
              <View style={styles.inlineTypingRow}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={styles.inlineTypingText}>
                  {isWaitingForResponse
                    ? 'Thinking through your question...'
                    : 'Streaming the explanation...'}
                </Text>
              </View>
            )}

            {item.isStreaming && hasBody ? (
              <Text style={styles.streamLabel}>Streaming...</Text>
            ) : null}

            {item.videoUrl && isLiveTutor ? (
              <TouchableOpacity onPress={() => openFullVideo(item.videoUrl!)}>
                <Text style={styles.videoTag}>Tutor video ready</Text>
              </TouchableOpacity>
            ) : null}

            {hasBody ? (
              <Text style={styles.timestamp}>
                {item.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            ) : null}
          </View>
        </View>
      );
    },
    [isLiveTutor, isWaitingForResponse, openFullVideo],
  );

  const renderEmptyState = useCallback(() => {
    if (isSessionLoading) {
      return (
        <View style={styles.emptyStateCard}>
          <ActivityIndicator color="#8B5CF6" />
          <Text style={styles.emptyTitle}>Loading course conversation</Text>
          <Text style={styles.emptyText}>
            Restoring the saved chat history for this course.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateCard}>
        <Text style={styles.emptyEyebrow}>
          {courseId ? 'Course session ready' : 'Start a new tutor session'}
        </Text>
        <Text style={styles.emptyTitle}>
          {courseId ? courseName : isLiveTutor ? 'Live Tutor' : 'AI Chat'}
        </Text>
        <Text style={styles.emptyText}>
          {courseId
            ? 'This conversation is scoped to the selected course, so follow-up questions stay tied to the same lesson context.'
            : 'Ask any technical question and the tutor will respond with structured explanations, examples, and clear next steps.'}
        </Text>
      </View>
    );
  }, [courseId, courseName, isLiveTutor, isSessionLoading]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
      isNearBottomRef.current =
        contentOffset.y + layoutMeasurement.height >=
        contentSize.height - AUTO_SCROLL_THRESHOLD;
    },
    [],
  );

  const handleContentSizeChange = useCallback(() => {
    if (isBusy || isGeneratingAvatar || messages.length <= 2) {
      maybeScrollToBottom(true);
    }
  }, [isBusy, isGeneratingAvatar, messages.length, maybeScrollToBottom]);

  const statusLine = isSessionLoading
    ? 'Loading the current course session...'
    : isWaitingForResponse
      ? 'Thinking through your question...'
      : streamingMessageId
        ? 'Streaming the explanation...'
        : isLiveTutor
          ? isGeneratingAvatar
            ? avatarStatus || 'Generating tutor video...'
            : avatarConfig?.avatar_ready
              ? 'Live Tutor ready'
              : 'Avatar setup required'
          : courseId
            ? 'Course-specific AI chat ready'
            : 'General AI tutor ready';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
      <KeyboardAvoidingView
        style={styles.outer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View style={styles.header}>
          <Animated.View style={[styles.headerIcon, {transform: [{scale: pulseAnim}]}]} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {isLiveTutor ? `Live Tutor - ${courseName}` : `AI Chat - ${courseName}`}
            </Text>
            <Text
              style={[
                styles.headerSub,
                (isBusy || isGeneratingAvatar || isSessionLoading) &&
                  styles.headerSubActive,
              ]}>
              {statusLine}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.courseSwitch}
            onPress={() => navigation.navigate('CourseSelection', {mode})}>
            <Text style={styles.courseSwitchText}>Courses</Text>
          </TouchableOpacity>
        </View>

        {courseId ? (
          <View style={styles.courseBadgeRow}>
            <Text style={styles.courseBadgeText}>
              {isLiveTutor ? 'Live Tutor' : 'AI Chat'} session: {courseName}
            </Text>
          </View>
        ) : null}

        {isLiveTutor ? (
          heroVideoUrl ? (
            <TouchableOpacity
              activeOpacity={0.94}
              style={styles.heroPanel}
              onPress={() => openFullVideo(heroVideoUrl)}>
              <Video
                source={{uri: heroVideoUrl}}
                style={styles.heroVideo}
                resizeMode="cover"
                paused={false}
                repeat={false}
                controls={false}
                onError={() => {
                  setHeroVideoUrl(null);
                  Alert.alert(
                    'Tutor preview unavailable',
                    'The latest tutor clip could not be loaded.',
                  );
                }}
              />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroLabel}>
                  {isGeneratingAvatar
                    ? 'Generating a fresh tutor video'
                    : 'Tap to open tutor video'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.heroPanelPlaceholder}>
              {avatarPreviewUrl ? (
                <Image source={{uri: avatarPreviewUrl}} style={styles.previewImage} />
              ) : (
                <Animated.View
                  style={[
                    styles.placeholderOrb,
                    {transform: [{scale: pulseAnim}]},
                  ]}
                />
              )}
              <Text style={styles.placeholderTitle}>Live Tutor preview</Text>
              <Text style={styles.placeholderText}>
                {avatarConfig?.avatar_ready
                  ? isGeneratingAvatar
                    ? avatarStatus || 'Generating tutor video...'
                    : 'Your D-ID tutor video will appear here after each answer.'
                  : 'Open Avatar Setup and upload a photo before using Live Tutor video.'}
              </Text>
            </View>
          )
        ) : (
          <View style={styles.modeBanner}>
            <Text style={styles.modeBannerLabel}>AI Chat mode</Text>
            <Text style={styles.modeBannerText}>
              Responses now render as markdown with headings, bullet lists, numbered steps, and code blocks for easier reading on mobile.
            </Text>
          </View>
        )}

        <NoticeBanner
          message={chatError}
          style={styles.banner}
          textStyle={styles.bannerText}
        />

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={[
            styles.msgContent,
            messages.length === 0 && styles.msgContentEmpty,
          ]}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={7}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={<View style={styles.listFooter} />}
        />

        {visibleSuggestions.length > 0 && !isBusy && !isSessionLoading ? (
          <View style={styles.suggestionsRow}>
            {visibleSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={`${suggestion}-${index}`}
                style={styles.chip}
                onPress={() => sendMessage(suggestion)}>
                <Text style={styles.chipText} numberOfLines={2}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder={
              isLiveTutor
                ? 'Ask your live tutor anything...'
                : courseId
                  ? `Ask about ${courseName}...`
                  : 'Ask AI anything...'
            }
            placeholderTextColor="#4B5563"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={800}
            returnKeyType="send"
            blurOnSubmit
            editable={!isBusy && !isSessionLoading}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.sendBtn,
              (!input.trim() || isBusy || isSessionLoading) && styles.sendBtnOff,
            ]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isBusy || isSessionLoading}>
            <Text style={styles.sendIcon}>{isBusy ? 'Wait' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#0A0A1B'},
  outer: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#1C1C3A',
    backgroundColor: '#0D0D24',
    gap: 12,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E1B4B',
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
  },
  headerText: {flex: 1},
  headerTitle: {color: '#FFFFFF', fontWeight: '700', fontSize: 15},
  headerSub: {color: '#4B5563', fontSize: 12, marginTop: 1},
  headerSubActive: {color: '#A78BFA'},
  courseSwitch: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    backgroundColor: '#12122A',
  },
  courseSwitchText: {color: '#DDD6FE', fontWeight: '700', fontSize: 12},
  courseBadgeRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#111126',
    borderBottomWidth: 1,
    borderColor: '#1C1C3A',
  },
  courseBadgeText: {color: '#C4B5FD', fontSize: 12, fontWeight: '700'},
  heroPanel: {height: 208, backgroundColor: '#000000', position: 'relative'},
  heroVideo: {width: '100%', height: '100%'},
  heroOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroLabel: {color: '#E5E7EB', fontSize: 12, fontWeight: '600'},
  heroPanelPlaceholder: {
    minHeight: 188,
    backgroundColor: '#0D0D24',
    borderBottomWidth: 1,
    borderColor: '#1C1C3A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  previewImage: {
    width: 96,
    height: 96,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3730A3',
  },
  placeholderOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E1B4B',
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
  },
  placeholderTitle: {color: '#FFFFFF', fontSize: 15, fontWeight: '700'},
  placeholderText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  modeBanner: {
    backgroundColor: '#101225',
    borderBottomWidth: 1,
    borderColor: '#1C1C3A',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  modeBannerLabel: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modeBannerText: {color: '#CBD5E1', fontSize: 13, lineHeight: 19},
  banner: {marginHorizontal: 14, marginTop: 12},
  bannerText: {fontSize: 12},
  messageList: {flex: 1},
  msgContent: {padding: 14, paddingBottom: 6},
  msgContentEmpty: {flexGrow: 1},
  listFooter: {height: 12},
  emptyStateCard: {
    marginTop: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#232348',
    backgroundColor: '#101225',
    paddingHorizontal: 20,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyEyebrow: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  msgRow: {flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end'},
  msgRowUser: {justifyContent: 'flex-end'},
  msgRowAI: {justifyContent: 'flex-start'},
  botDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E1B4B',
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bubbleUser: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 6,
  },
  bubbleAI: {
    backgroundColor: '#12122A',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#232348',
  },
  msgText: {fontSize: 15, lineHeight: 22},
  msgTextUser: {color: '#FFFFFF'},
  inlineTypingRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  inlineTypingText: {color: '#C4B5FD', fontSize: 13},
  streamLabel: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  videoTag: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  timestamp: {fontSize: 10, color: '#6B7280', marginTop: 6, alignSelf: 'flex-end'},
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  chip: {
    backgroundColor: '#1E1B4B',
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3730A3',
    maxWidth: '100%',
  },
  chipText: {color: '#DDD6FE', fontSize: 13, lineHeight: 18},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#1C1C3A',
    backgroundColor: '#0D0D24',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#12122A',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  sendBtn: {
    minWidth: 58,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  sendBtnOff: {backgroundColor: '#1E1E40'},
  sendIcon: {color: '#FFFFFF', fontSize: 13, fontWeight: '700'},
});

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
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
import NoticeBanner from '../components/NoticeBanner';
import {
  avatarAPI,
  extractErrorMessage,
  getApiBaseUrl,
  tutorAPI,
  uploadAPI,
} from '../services/api';
import {pollAvatarJob} from '../services/avatarService';
import {AvatarConfig, Message, TutorMode, TutorStackParamList} from '../types';

type ChatRoute = RouteProp<TutorStackParamList, 'TutorChat'>;
type ChatNav = NativeStackNavigationProp<TutorStackParamList, 'TutorChat'>;

let messageCounter = 0;
const nextId = () => `msg-${++messageCounter}`;

async function toAbsUrl(url: string): Promise<string> {
  if (url.startsWith('http')) {
    return url;
  }

  const baseUrl = await getApiBaseUrl();
  return `${baseUrl}${url}`;
}

export default function ChatScreen() {
  const navigation = useNavigation<ChatNav>();
  const route = useRoute<ChatRoute>();
  const courseId = route.params?.courseId;
  const courseName = route.params?.courseName ?? 'General AI Tutor';
  const mode: TutorMode = route.params?.mode ?? 'chat';
  const isLiveTutor = mode === 'liveTutor';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      role: 'assistant',
      content: isLiveTutor
        ? courseId
          ? `Welcome to Live Tutor for ${courseName}. Ask a question and I will teach it step by step, then generate a talking video response.`
          : 'Welcome to Live Tutor. Ask a question and I will explain it, then generate a talking tutor video.'
        : courseId
          ? `Hi, I am your AI chat tutor for ${courseName}. Ask anything and I will keep the answer fast and clear.`
          : 'Hi, I am your AI chat tutor. Ask anything for a fast text explanation.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState('');
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);

  const listRef = useRef<FlatList<Message>>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const isMountedRef = useRef(true);
  const latestAvatarTokenRef = useRef<string | null>(null);

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
      if (preview) {
        setAvatarPreviewUrl(await toAbsUrl(preview));
      } else {
        setAvatarPreviewUrl(null);
      }

      if (config.last_generated_clip_url) {
        setHeroVideoUrl(await toAbsUrl(config.last_generated_clip_url));
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
    return () => {
      isMountedRef.current = false;
      pulseLoop.current?.stop();
    };
  }, []);

  useEffect(() => {
    const shouldPulse = isSending || isGeneratingAvatar;

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
  }, [isGeneratingAvatar, isSending, pulseAnim]);

  useEffect(() => {
    loadAvatarState().catch(() => {});
  }, [loadAvatarState]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAvatarState().catch(() => {});
    });
    return unsubscribe;
  }, [loadAvatarState, navigation]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 120);
  }, []);

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
    async (jobId: string, messageId: string) => {
      const token = `${messageId}-${Date.now()}`;
      latestAvatarTokenRef.current = token;
      setIsGeneratingAvatar(true);
      setAvatarStatus('Preparing tutor video...');

      try {
        const videoUrl = await pollAvatarJob(jobId, status => {
          if (!isMountedRef.current || latestAvatarTokenRef.current !== token) {
            return;
          }

          setAvatarStatus(status);
        });

        if (!isMountedRef.current || latestAvatarTokenRef.current !== token) {
          return;
        }

        const fullUrl = await toAbsUrl(videoUrl);

        if (!isMountedRef.current || latestAvatarTokenRef.current !== token) {
          return;
        }

        setHeroVideoUrl(fullUrl);
        setMessages(current =>
          current.map(message =>
            message.id === messageId
              ? {
                  ...message,
                  videoUrl: fullUrl,
                }
              : message,
          ),
        );
      } catch (error) {
        if (isMountedRef.current && latestAvatarTokenRef.current === token) {
          setChatError(
            extractErrorMessage(
              error,
              'The tutor reply was generated, but the video response could not be finished.',
            ),
          );
          setAvatarStatus('');
        }
      } finally {
        if (isMountedRef.current && latestAvatarTokenRef.current === token) {
          setIsGeneratingAvatar(false);
          setAvatarStatus('');
        }
      }
    },
    [],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();

      if (!trimmed || isSending) {
        return;
      }

      const userMessage: Message = {
        id: nextId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages(current => [...current, userMessage]);
      setInput('');
      setSuggestions([]);
      setChatError(null);
      scrollToBottom();
      setIsSending(true);

      try {
        const response = await tutorAPI.askTutor({
          message: trimmed,
          courseId,
        });

        if (!isMountedRef.current) {
          return;
        }

        const assistantResponse =
          typeof response.data?.response === 'string' &&
          response.data.response.trim()
            ? response.data.response.trim()
            : 'I could not generate a response just now.';

        const assistantMessageId = nextId();
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: assistantResponse,
          timestamp: new Date(),
        };

        setMessages(current => [...current, assistantMessage]);
        setSuggestions(
          Array.isArray(response.data?.suggestions)
            ? response.data.suggestions
                .filter(
                  (item: unknown): item is string =>
                    typeof item === 'string' && item.trim().length > 0,
                )
                .slice(0, 3)
            : [],
        );

        scrollToBottom();

        if (!isLiveTutor) {
          return;
        }

        const currentAvatarId =
          avatarConfig?.avatar_ready && avatarConfig.avatar_id
            ? avatarConfig.avatar_id
            : null;

        if (!currentAvatarId) {
          setChatError(
            'Live Tutor needs a D-ID avatar first. Open Avatar Setup, upload a photo, and try again.',
          );
          return;
        }

        setIsGeneratingAvatar(true);
        setAvatarStatus('Sending explanation to D-ID...');

        const speakResponse = await avatarAPI.speak({
          avatarId: currentAvatarId,
          text: assistantResponse,
        });

        if (!isMountedRef.current) {
          return;
        }

        const videoUrl = speakResponse.data?.video_url;
        if (videoUrl) {
          const fullUrl = await toAbsUrl(videoUrl);
          setHeroVideoUrl(fullUrl);
          setMessages(current =>
            current.map(message =>
              message.id === assistantMessageId
                ? {
                    ...message,
                    videoUrl: fullUrl,
                  }
                : message,
            ),
          );
          setIsGeneratingAvatar(false);
          setAvatarStatus('');
        } else if (speakResponse.data?.job_id) {
          startAvatarPolling(speakResponse.data.job_id, assistantMessageId).catch(
            () => {},
          );
        } else {
          setIsGeneratingAvatar(false);
          setAvatarStatus('');
          setChatError('Live Tutor did not return a video job id.');
        }
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }

        setIsGeneratingAvatar(false);
        setAvatarStatus('');
        setChatError(
          extractErrorMessage(
            error,
            'Failed to get a response. Check your connection.',
          ),
        );
      } finally {
        if (isMountedRef.current) {
          setIsSending(false);
        }
      }
    },
    [avatarConfig, courseId, isLiveTutor, isSending, scrollToBottom, startAvatarPolling],
  );

  const renderMessage = ({item}: {item: Message}) => {
    const isUser = item.role === 'user';

    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}>
        {!isUser && <View style={styles.botDot} />}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAI]}>
            {item.content}
          </Text>
          {item.videoUrl ? (
            <TouchableOpacity onPress={() => openFullVideo(item.videoUrl!)}>
              <Text style={styles.videoTag}>Tutor video ready</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const statusLine = isSending
    ? 'Thinking through your question...'
    : isLiveTutor
      ? isGeneratingAvatar
        ? avatarStatus || 'Generating tutor video...'
        : avatarConfig?.avatar_ready
          ? 'Live Tutor ready'
          : 'Avatar setup required'
      : courseId
        ? 'AI Chat ready for your course'
        : 'Fast text-only tutor mode';

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
              {isLiveTutor ? `Live Tutor • ${courseName}` : `AI Chat • ${courseName}`}
            </Text>
            <Text
              style={[
                styles.headerSub,
                (isSending || isGeneratingAvatar) && styles.headerSubActive,
              ]}>
              {statusLine}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.courseSwitch}
            onPress={() =>
              navigation.navigate('CourseSelection', {
                mode,
              })
            }>
            <Text style={styles.courseSwitchText}>Courses</Text>
          </TouchableOpacity>
        </View>

        {courseId ? (
          <View style={styles.courseBadgeRow}>
            <Text style={styles.courseBadgeText}>
              {isLiveTutor ? 'Live Tutor' : 'AI Chat'} course: {courseName}
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
              This view is text only for faster answers. Switch to Live Tutor when you want video responses.
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
          contentContainerStyle={styles.msgContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderMessage}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={7}
          ListFooterComponent={<View style={styles.listFooter} />}
        />

        {isSending && (
          <View style={styles.typingRow}>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#6C63FF" />
              <Text style={styles.typingText}>Thinking through your question...</Text>
            </View>
          </View>
        )}

        {suggestions.length > 0 && !isSending && (
          <View style={styles.suggestionsRow}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={`${suggestion}-${index}`}
                style={styles.chip}
                onPress={() => sendMessage(suggestion)}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder={
              isLiveTutor
                ? 'Ask your live tutor anything...'
                : 'Ask AI anything...'
            }
            placeholderTextColor="#4B5563"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.sendBtn, (!input.trim() || isSending) && styles.sendBtnOff]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isSending}>
            <Text style={styles.sendIcon}>Send</Text>
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
    borderColor: '#6C63FF',
  },
  headerText: {flex: 1},
  headerTitle: {color: '#FFFFFF', fontWeight: '700', fontSize: 15},
  headerSub: {color: '#4B5563', fontSize: 12, marginTop: 1},
  headerSubActive: {color: '#6C63FF'},
  courseSwitch: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    backgroundColor: '#12122A',
  },
  courseSwitchText: {color: '#C7D2FE', fontWeight: '700', fontSize: 12},
  courseBadgeRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#111126',
    borderBottomWidth: 1,
    borderColor: '#1C1C3A',
  },
  courseBadgeText: {color: '#A5B4FC', fontSize: 12, fontWeight: '700'},
  heroPanel: {
    height: 208,
    backgroundColor: '#000000',
    position: 'relative',
  },
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
    borderColor: '#6C63FF',
  },
  placeholderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  placeholderText: {
    color: '#6B7280',
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
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modeBannerText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 19,
  },
  banner: {
    marginHorizontal: 14,
    marginTop: 12,
  },
  bannerText: {
    fontSize: 12,
  },
  messageList: {flex: 1},
  msgContent: {padding: 14, paddingBottom: 6},
  listFooter: {height: 12},
  msgRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
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
  bubble: {maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10},
  bubbleUser: {
    backgroundColor: '#6C63FF',
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: '#12122A',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#1E1E40',
  },
  msgText: {fontSize: 15, lineHeight: 22},
  msgTextUser: {color: '#FFFFFF'},
  msgTextAI: {color: '#E5E7EB'},
  videoTag: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  timestamp: {fontSize: 10, color: '#6B7280', marginTop: 4, alignSelf: 'flex-end'},
  typingRow: {paddingHorizontal: 14, paddingBottom: 6},
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#12122A',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1E1E40',
  },
  typingText: {color: '#9CA3AF', fontSize: 13},
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  chip: {
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#3730A3',
    maxWidth: 220,
  },
  chipText: {color: '#A5B4FC', fontSize: 13},
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
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  sendBtn: {
    minWidth: 56,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  sendBtnOff: {backgroundColor: '#1E1E40'},
  sendIcon: {color: '#FFFFFF', fontSize: 13, fontWeight: '700'},
});

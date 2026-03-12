import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import Video from 'react-native-video';
import {tutorAPI} from '../services/api';
import {generateAndPollAvatar} from '../services/avatarService';
import {BASE_URL} from '../services/api';
import {Message, MainTabParamList} from '../types';

type ChatRoute = RouteProp<MainTabParamList, 'Chat'>;

let _msgId = 0;
const nextId = () => String(++_msgId);

function toAbsUrl(url: string): string {
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
}

export default function ChatScreen() {
  const route = useRoute<ChatRoute>();
  const courseId = route.params?.courseId;
  const courseName = route.params?.courseName ?? 'AI Tutor';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      role: 'assistant',
      content: `Hi! I'm your AI tutor${courseName !== 'AI Tutor' ? ` for **${courseName}**` : ''}. Ask me anything! 🎓`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState('');
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const listRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isLoading) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {toValue: 1.15, duration: 600, useNativeDriver: true}),
          Animated.timing(pulseAnim, {toValue: 1, duration: 600, useNativeDriver: true}),
        ]),
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
  }, [isLoading, pulseAnim]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 120);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) {
        return;
      }

      const userMsg: Message = {id: nextId(), role: 'user', content: trimmed, timestamp: new Date()};
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setSuggestions([]);
      setIsLoading(true);
      setHeroVideoUrl(null);
      setAvatarStatus('');
      scrollToBottom();

      try {
        // ── 1. Get AI text response ────────────────────────────────────────────
        const resp = await tutorAPI.chat(trimmed, courseId);
        const {response, suggestions: suggs} = resp.data;

        const aiMsgId = nextId();
        const aiMsg: Message = {
          id: aiMsgId,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMsg]);
        setSuggestions(suggs ?? []);
        scrollToBottom();

        // ── 2. Generate avatar video (async, best-effort) ─────────────────────
        try {
          setAvatarStatus('Preparing avatar...');
          const videoUrl = await generateAndPollAvatar(response, setAvatarStatus);
          const fullUrl = toAbsUrl(videoUrl);
          setHeroVideoUrl(fullUrl);
          setMessages(prev =>
            prev.map(m => (m.id === aiMsgId ? {...m, videoUrl: fullUrl} : m)),
          );
        } catch {
          // Avatar is optional — silently skip if SadTalker isn't running
        }
      } catch (err: any) {
        Alert.alert(
          'Tutor Error',
          err.response?.data?.detail ?? 'Failed to get a response. Check your connection.',
        );
      } finally {
        setIsLoading(false);
        setAvatarStatus('');
      }
    },
    [isLoading, courseId, scrollToBottom],
  );

  const renderMessage = ({item}: {item: Message}) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}>
        {!isUser && (
          <View style={styles.botDot}>
            <Text style={{fontSize: 14}}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAI]}>
            {item.content}
          </Text>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
          </Text>
        </View>
      </View>
    );
  };

  const statusLine = isLoading ? (avatarStatus || 'Thinking...') : 'AI Tutor · Online';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
      <KeyboardAvoidingView
        style={styles.outer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Animated.View style={[styles.headerIcon, {transform: [{scale: pulseAnim}]}]}>
            <Text style={{fontSize: 20}}>🤖</Text>
          </Animated.View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle} numberOfLines={1}>{courseName}</Text>
            <Text style={[styles.headerSub, isLoading && styles.headerSubActive]}>
              {statusLine}
            </Text>
          </View>
        </View>

        {/* ── Avatar hero video ────────────────────────────────────────────── */}
        {heroVideoUrl ? (
          <View style={styles.heroPanel}>
            <Video
              source={{uri: heroVideoUrl}}
              style={styles.heroVideo}
              resizeMode="cover"
              paused={false}
              repeat={false}
              controls={false}
            />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroLabel}>🎬 Avatar Response</Text>
            </View>
          </View>
        ) : (
          <View style={styles.heroPanelPlaceholder}>
            <Animated.Text style={[styles.placeholderEmoji, {transform: [{scale: pulseAnim}]}]}>
              {isLoading ? '⏳' : '🤖'}
            </Animated.Text>
            <Text style={styles.placeholderText}>
              {isLoading ? avatarStatus || 'AI is thinking...' : 'Avatar will appear here'}
            </Text>
          </View>
        )}

        {/* ── Messages ────────────────────────────────────────────────────── */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.msgContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderMessage}
        />

        {/* ── Typing indicator ─────────────────────────────────────────────── */}
        {isLoading && (
          <View style={styles.typingRow}>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#6C63FF" />
              <Text style={styles.typingText}>{avatarStatus || 'Thinking...'}</Text>
            </View>
          </View>
        )}

        {/* ── Suggestions ──────────────────────────────────────────────────── */}
        {suggestions.length > 0 && !isLoading && (
          <View style={styles.suggestionsRow}>
            {suggestions.slice(0, 3).map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.chip}
                onPress={() => sendMessage(s)}>
                <Text style={styles.chipText} numberOfLines={1}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Input bar ────────────────────────────────────────────────────── */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask your tutor anything..."
            placeholderTextColor="#4B5563"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!input.trim() || isLoading) && styles.sendBtnOff,
            ]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}>
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#0A0A1B'},
  outer: {flex: 1},

  // Header
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#6C63FF',
  },
  headerText: {flex: 1},
  headerTitle: {color: '#FFFFFF', fontWeight: '700', fontSize: 15},
  headerSub: {color: '#4B5563', fontSize: 12, marginTop: 1},
  headerSubActive: {color: '#6C63FF'},

  // Hero avatar panel
  heroPanel: {
    height: 200,
    backgroundColor: '#000',
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
    height: 140,
    backgroundColor: '#0D0D24',
    borderBottomWidth: 1,
    borderColor: '#1C1C3A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderEmoji: {fontSize: 40},
  placeholderText: {color: '#374151', fontSize: 13},

  // Messages
  messageList: {flex: 1},
  msgContent: {padding: 14, paddingBottom: 6},
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10},
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
  timestamp: {fontSize: 10, color: '#6B7280', marginTop: 4, alignSelf: 'flex-end'},

  // Typing
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

  // Suggestions
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

  // Input
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnOff: {backgroundColor: '#1E1E40'},
  sendIcon: {color: '#FFFFFF', fontSize: 20, fontWeight: '700'},
});

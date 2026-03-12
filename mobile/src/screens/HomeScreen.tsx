import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useAuthStore} from '../store/authStore';
import {coursesAPI} from '../services/api';
import {Course, MainTabParamList} from '../types';

type Nav = BottomTabNavigationProp<MainTabParamList, 'Home'>;

const SUBJECT_EMOJI: Record<string, string> = {
  math: '📐',
  physics: '⚛️',
  chemistry: '🧪',
  biology: '🧬',
  history: '📜',
  english: '📖',
  programming: '💻',
  science: '🔬',
  default: '📚',
};

const QUICK_ACTIONS = [
  {tab: 'Chat', emoji: '💬', label: 'Ask AI Tutor', bg: '#1B1B34'},
  {tab: 'Avatar', emoji: '🤖', label: 'My Avatar', bg: '#131B2E'},
  {tab: 'Profile', emoji: '📂', label: 'Materials', bg: '#1B1B34'},
] as const;

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const {user, logout} = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      const resp = await coursesAPI.getAll();
      setCourses(resp.data);
    } catch {
      Alert.alert('Error', 'Could not load courses.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleLogout = () =>
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: logout},
    ]);

  const subjectEmoji = (subject: string) =>
    SUBJECT_EMOJI[subject?.toLowerCase()] ?? SUBJECT_EMOJI.default;

  const renderCourse = ({item}: {item: Course}) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() =>
        nav.navigate('Chat', {courseId: item.id, courseName: item.title})
      }>
      <View style={styles.courseIcon}>
        <Text style={{fontSize: 26}}>{subjectEmoji(item.subject)}</Text>
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.courseMeta}>
          {item.subject} · {item.difficulty_level}
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
      <View style={styles.container}>
        {/* ── Header ─────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.full_name?.split(' ')[0] ?? user?.username} 👋
            </Text>
            <Text style={styles.sub}>What are we learning today?</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutBtn}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* ── Quick actions ──────────────────────────────── */}
        <View style={styles.actions}>
          {QUICK_ACTIONS.map(a => (
            <TouchableOpacity
              key={a.tab}
              style={[styles.actionCard, {backgroundColor: a.bg}]}
              onPress={() => nav.navigate(a.tab as any)}>
              <Text style={styles.actionEmoji}>{a.emoji}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Courses list ───────────────────────────────── */}
        <Text style={styles.sectionTitle}>Your Courses</Text>
        {loading ? (
          <ActivityIndicator color="#6C63FF" style={{marginTop: 40}} />
        ) : (
          <FlatList
            data={courses}
            keyExtractor={item => String(item.id)}
            renderItem={renderCourse}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchCourses();
                }}
                tintColor="#6C63FF"
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📚</Text>
                <Text style={styles.emptyTitle}>No courses yet</Text>
                <Text style={styles.emptySub}>
                  Tap "Ask AI Tutor" and say "Create a course on Python"!
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#0A0A1B'},
  container: {flex: 1, paddingHorizontal: 20},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 20,
  },
  greeting: {fontSize: 22, fontWeight: '800', color: '#FFFFFF'},
  sub: {color: '#6B7280', marginTop: 2, fontSize: 13},
  logoutBtn: {color: '#EF4444', fontSize: 13, fontWeight: '600', marginTop: 4},
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E1E40',
  },
  actionEmoji: {fontSize: 26, marginBottom: 5},
  actionLabel: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12122A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E40',
  },
  courseIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1C1C3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  courseInfo: {flex: 1},
  courseTitle: {color: '#FFFFFF', fontWeight: '700', fontSize: 15},
  courseMeta: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 3,
    textTransform: 'capitalize',
  },
  arrow: {color: '#6C63FF', fontSize: 26, fontWeight: '300'},
  empty: {alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30},
  emptyEmoji: {fontSize: 52, marginBottom: 14},
  emptyTitle: {color: '#FFFFFF', fontSize: 19, fontWeight: '700'},
  emptySub: {
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

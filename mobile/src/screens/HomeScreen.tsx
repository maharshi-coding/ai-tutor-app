import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NoticeBanner from '../components/NoticeBanner';
import {extractErrorMessage, coursesAPI} from '../services/api';
import {useAuthStore} from '../store/authStore';
import {Course, MainTabParamList} from '../types';

type Nav = BottomTabNavigationProp<MainTabParamList, 'Home'>;
type QuickAction = {
  tab: keyof MainTabParamList;
  label: string;
  caption: string;
  bg: string;
};

const SUBJECT_LABELS: Record<string, string> = {
  math: 'MATH',
  physics: 'PHYS',
  chemistry: 'CHEM',
  biology: 'BIO',
  history: 'HIST',
  english: 'ENG',
  programming: 'CODE',
  science: 'SCI',
  default: 'COURSE',
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    tab: 'Chat',
    label: 'Ask AI',
    caption: 'Start a live tutor chat',
    bg: '#1B1B34',
  },
  {
    tab: 'Avatar',
    label: 'Avatar',
    caption: 'Set up your tutor video',
    bg: '#131B2E',
  },
  {
    tab: 'Profile',
    label: 'Materials',
    caption: 'Upload study content',
    bg: '#1B1B34',
  },
];

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCourses = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }

    try {
      const response = await coursesAPI.getAll();
      setCourses(Array.isArray(response.data) ? response.data : []);
      setLoadError(null);
    } catch (error) {
      setLoadError(
        extractErrorMessage(
          error,
          'Could not load your courses. Please try again.',
        ),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCourses().catch(() => {});
  }, [loadCourses]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCourses(true).catch(() => {});
  };

  const handleLogout = () =>
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          logout().catch(() => {});
        },
      },
    ]);

  const subjectLabel = (subject: string) =>
    SUBJECT_LABELS[subject?.toLowerCase()] ?? SUBJECT_LABELS.default;

  const renderCourse = ({item}: {item: Course}) => (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.courseCard}
      onPress={() =>
        nav.navigate('Chat', {courseId: item.id, courseName: item.title})
      }>
      <View style={styles.courseBadge}>
        <Text style={styles.courseBadgeText}>{subjectLabel(item.subject)}</Text>
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.courseMeta}>
          {item.subject} · {item.difficulty_level}
        </Text>
      </View>
      <Text style={styles.arrow}>Open</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.greeting}>
              Hello, {user?.full_name?.split(' ')[0] ?? user?.username ?? 'there'}
            </Text>
            <Text style={styles.sub}>Choose a course or jump straight into tutoring.</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutBtn}>Sign out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.tab}
              activeOpacity={0.88}
              style={[styles.actionCard, {backgroundColor: action.bg}]}
              onPress={() => nav.navigate(action.tab)}>
              <Text style={styles.actionHeading}>{action.label}</Text>
              <Text style={styles.actionCaption}>{action.caption}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Your courses</Text>
          <TouchableOpacity onPress={handleRefresh} disabled={loading || refreshing}>
            <Text style={styles.refreshLink}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <NoticeBanner message={loadError} style={styles.banner} />

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color="#6C63FF" />
            <Text style={styles.loadingText}>Loading your course space...</Text>
          </View>
        ) : (
          <FlatList
            data={courses}
            keyExtractor={item => String(item.id)}
            renderItem={renderCourse}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              courses.length === 0 ? styles.emptyListContent : styles.listContent
            }
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#6C63FF"
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No courses yet</Text>
                <Text style={styles.emptySub}>
                  Start a tutor chat and ask for a new course to get going.
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
    gap: 16,
  },
  headerCopy: {
    flex: 1,
  },
  greeting: {fontSize: 24, fontWeight: '800', color: '#FFFFFF'},
  sub: {color: '#6B7280', marginTop: 4, fontSize: 13, lineHeight: 19},
  logoutBtn: {color: '#EF4444', fontSize: 13, fontWeight: '600', marginTop: 4},
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  actionCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E1E40',
    justifyContent: 'space-between',
  },
  actionHeading: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionCaption: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  refreshLink: {
    color: '#6C63FF',
    fontSize: 13,
    fontWeight: '600',
  },
  banner: {
    marginBottom: 12,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 24,
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
  courseBadge: {
    minWidth: 68,
    borderRadius: 14,
    backgroundColor: '#1C1C3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  courseBadgeText: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  courseInfo: {flex: 1},
  courseTitle: {color: '#FFFFFF', fontWeight: '700', fontSize: 15},
  courseMeta: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 3,
    textTransform: 'capitalize',
  },
  arrow: {
    color: '#6C63FF',
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30},
  emptyTitle: {color: '#FFFFFF', fontSize: 19, fontWeight: '700'},
  emptySub: {
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

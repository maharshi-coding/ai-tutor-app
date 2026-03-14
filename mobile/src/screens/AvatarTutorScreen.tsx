import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NoticeBanner from '../components/NoticeBanner';
import {
  coursesAPI,
  dailyVideoAPI,
  extractErrorMessage,
  getApiBaseUrl,
  uploadAPI,
} from '../services/api';
import {pollAvatarJob} from '../services/avatarService';
import {AvatarConfig, Course, DailyVideoStatus, TutorStackParamList} from '../types';

type Nav = NativeStackNavigationProp<TutorStackParamList, 'AvatarTutor'>;

async function toAbsUrl(path?: string | null): Promise<string | null> {
  if (!path) {
    return null;
  }

  if (path.startsWith('http')) {
    return path;
  }

  const baseUrl = await getApiBaseUrl();
  return `${baseUrl}${path}`;
}

export default function AvatarTutorScreen() {
  const navigation = useNavigation<Nav>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null);
  const [dailyVideo, setDailyVideo] = useState<DailyVideoStatus | null>(null);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [dailyVideoUrl, setDailyVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [screenMessage, setScreenMessage] = useState<string | null>(null);
  const [isRefreshingVideo, setIsRefreshingVideo] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setScreenMessage(null);

    try {
      const [coursesResponse, avatarResponse, dailyVideoResponse] = await Promise.all([
        coursesAPI.getAll(),
        uploadAPI.getAvatarConfig(),
        dailyVideoAPI.getLatest(),
      ]);

      const nextCourses = Array.isArray(coursesResponse.data)
        ? coursesResponse.data
        : [];
      const nextConfig = avatarResponse.data as AvatarConfig;
      const nextDaily = dailyVideoResponse.data as DailyVideoStatus;

      setCourses(nextCourses);
      setAvatarConfig(nextConfig);
      setDailyVideo(nextDaily);
      setAvatarImageUrl(
        await toAbsUrl(
          nextConfig.avatar_image_url ||
            nextConfig.character_image_url ||
            nextConfig.photo_path,
        ),
      );
      setDailyVideoUrl(await toAbsUrl(nextDaily.video_url));
    } catch (error) {
      setScreenMessage(
        extractErrorMessage(
          error,
          'Could not load your daily tech update workspace right now.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData().catch(() => {});
  }, [loadData]);

  const openChat = (course?: Course) =>
    navigation.navigate('TutorChat', {
      courseId: course?.id,
      courseName: course?.title,
      mode: 'liveTutor',
    });

  const generateLatestVideo = useCallback(async () => {
    if (!avatarConfig?.avatar_ready) {
      navigation.navigate('AvatarSetup');
      return;
    }

    setIsRefreshingVideo(true);
    setScreenMessage(null);

    try {
      const response = await dailyVideoAPI.generate();
      if (!response.data.video_url) {
        await pollAvatarJob(response.data.job_id);
      }
      await loadData();
      setScreenMessage("Today's tech briefing has been refreshed.");
    } catch (error) {
      setScreenMessage(
        extractErrorMessage(
          error,
          'Could not refresh the daily tech briefing right now.',
        ),
      );
    } finally {
      setIsRefreshingVideo(false);
    }
  }, [avatarConfig?.avatar_ready, loadData, navigation]);

  const avatarStatus = avatarConfig?.avatar_ready
    ? 'Avatar ready for daily briefings'
    : avatarConfig?.has_photo
      ? 'Photo saved, stylized avatar pending'
      : 'Upload a photo to unlock daily briefings';

  const dailyStatusLabel =
    dailyVideo?.status === 'done'
      ? dailyVideo.title || "Today's briefing is ready"
      : dailyVideo?.status === 'processing'
        ? "Generating today's briefing"
        : avatarConfig?.avatar_ready
          ? 'Generate your first daily tech update'
          : 'Upload a photo to begin';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Daily tech updates</Text>
        <Text style={styles.sub}>
          Watch a fresh daily briefing animated with your avatar, then jump into
          course chat whenever you want deeper tutoring.
        </Text>

        <NoticeBanner message={screenMessage} style={styles.banner} />

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>Briefing status</Text>
            <Text style={styles.heroTitle}>{dailyStatusLabel}</Text>
            <Text style={styles.heroText}>
              {dailyVideo?.summary ||
                'The app fetches current technology headlines, summarizes them into a one-minute script, and renders a new avatar video for you.'}
            </Text>
          </View>

          {avatarImageUrl ? (
            <Image source={{uri: avatarImageUrl}} style={styles.avatarPreview} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>Tech</Text>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.actionBtn, styles.primaryBtn]}
            onPress={generateLatestVideo}
            disabled={isRefreshingVideo}>
            {isRefreshingVideo ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>Refresh briefing</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.actionBtn, styles.secondaryBtn]}
            onPress={() => navigation.navigate('AvatarSetup')}>
            <Text style={styles.secondaryBtnText}>Avatar setup</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Avatar pipeline</Text>
          <Text style={styles.cardText}>
            {avatarStatus}. Hedra handles animation, while Coqui generates the
            speech track for each saved update.
          </Text>
          {avatarConfig?.avatar_id ? (
            <Text style={styles.metaText}>Avatar ID: {avatarConfig.avatar_id}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Latest highlights</Text>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#6C63FF" />
              <Text style={styles.loadingText}>Loading today's briefing...</Text>
            </View>
          ) : dailyVideo?.highlights?.length ? (
            dailyVideo.highlights.map((item, index) => (
              <View key={`${item}-${index}`} style={styles.highlightRow}>
                <View style={styles.highlightDot} />
                <Text style={styles.highlightText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.cardText}>
              Generate today's update to see the latest saved highlights here.
            </Text>
          )}
        </View>

        {dailyVideoUrl ? (
          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.videoCard}
            onPress={() =>
              navigation.navigate('AvatarVideoPlayer', {
                videoUrl: dailyVideoUrl,
                title: dailyVideo?.title || 'Daily tech briefing',
              })
            }>
            <Text style={styles.cardTitle}>Watch latest video</Text>
            <Text style={styles.cardText}>
              {dailyVideo?.generated_at
                ? `Generated ${new Date(dailyVideo.generated_at).toLocaleString()}`
                : 'Tap to open the latest generated briefing.'}
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Featured courses</Text>
            <TouchableOpacity onPress={loadData} disabled={loading}>
              <Text style={styles.refreshLink}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#6C63FF" />
              <Text style={styles.loadingText}>Preparing your tutor space...</Text>
            </View>
          ) : (
            courses.slice(0, 4).map(course => (
              <TouchableOpacity
                key={course.id}
                activeOpacity={0.88}
                style={styles.courseCard}
                onPress={() => openChat(course)}>
                <View style={styles.courseMeta}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseSubtitle}>
                    {course.subject} - {course.difficulty_level}
                  </Text>
                </View>
                <Text style={styles.courseCta}>Open</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Need deeper help?</Text>
          <Text style={styles.cardText}>
            Open Live Tutor chat to turn your avatar into an on-demand teaching
            assistant for course questions and follow-up explanations.
          </Text>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.actionBtn, styles.secondaryBtn, styles.setupBtn]}
            onPress={() => openChat()}>
            <Text style={styles.secondaryBtnText}>Start live tutor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#0A0A1B'},
  container: {flex: 1, paddingHorizontal: 20},
  content: {paddingBottom: 40},
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 20,
  },
  sub: {
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 21,
  },
  banner: {marginBottom: 14},
  heroCard: {
    backgroundColor: '#12122A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E1E40',
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  heroCopy: {flex: 1},
  heroLabel: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroText: {color: '#9CA3AF', fontSize: 14, lineHeight: 21},
  avatarPreview: {
    width: 112,
    height: 112,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3730A3',
    backgroundColor: '#1E1B4B',
  },
  avatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 20,
    backgroundColor: '#1E1B4B',
    borderWidth: 1,
    borderColor: '#3730A3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: '#C7D2FE',
    fontSize: 20,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  setupBtn: {
    marginTop: 16,
  },
  primaryBtn: {backgroundColor: '#6C63FF'},
  secondaryBtn: {
    backgroundColor: '#1B1B34',
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  primaryBtnText: {color: '#FFFFFF', fontWeight: '700', fontSize: 15},
  secondaryBtnText: {color: '#C7D2FE', fontWeight: '700', fontSize: 15},
  card: {
    backgroundColor: '#12122A',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E1E40',
    marginBottom: 16,
  },
  videoCard: {
    backgroundColor: '#161633',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#312E81',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {color: '#FFFFFF', fontWeight: '700', fontSize: 18},
  cardText: {color: '#9CA3AF', fontSize: 14, lineHeight: 21, marginTop: 8},
  metaText: {color: '#A5B4FC', fontSize: 12, marginTop: 10},
  refreshLink: {color: '#6C63FF', fontWeight: '700', fontSize: 13},
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  loadingText: {color: '#9CA3AF', fontSize: 14},
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  highlightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6C63FF',
    marginTop: 7,
  },
  highlightText: {flex: 1, color: '#E5E7EB', fontSize: 14, lineHeight: 21},
  courseCard: {
    backgroundColor: '#1B1B34',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#25254A',
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseMeta: {flex: 1},
  courseTitle: {color: '#FFFFFF', fontWeight: '700', fontSize: 15},
  courseSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  courseCta: {color: '#A5B4FC', fontSize: 13, fontWeight: '700'},
});

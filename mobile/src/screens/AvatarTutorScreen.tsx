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
import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NoticeBanner from '../components/NoticeBanner';
import {
  coursesAPI,
  extractErrorMessage,
  getApiBaseUrl,
  uploadAPI,
} from '../services/api';
import {AvatarConfig, Course, TutorStackParamList} from '../types';

type Nav = NativeStackNavigationProp<TutorStackParamList, 'AvatarTutor'>;

export default function AvatarTutorScreen() {
  const navigation = useNavigation<Nav>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [screenMessage, setScreenMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setScreenMessage(null);

    try {
      const [coursesResponse, avatarResponse] = await Promise.all([
        coursesAPI.getAll(),
        uploadAPI.getAvatarConfig(),
      ]);

      const nextCourses = Array.isArray(coursesResponse.data)
        ? coursesResponse.data
        : [];
      const nextConfig = avatarResponse.data as AvatarConfig;
      setCourses(nextCourses);
      setAvatarConfig(nextConfig);

      const imageUrl = nextConfig.character_image_url || nextConfig.photo_path;
      if (imageUrl) {
        const baseUrl = await getApiBaseUrl();
        setAvatarImageUrl(
          imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`,
        );
      } else {
        setAvatarImageUrl(null);
      }
    } catch (error) {
      setScreenMessage(
        extractErrorMessage(
          error,
          'Could not load your avatar tutor workspace right now.',
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
    });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Avatar tutor</Text>
        <Text style={styles.sub}>
          Learn with a course-aware AI tutor that can talk back using your avatar.
        </Text>

        <NoticeBanner message={screenMessage} style={styles.banner} />

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>Tutor status</Text>
            <Text style={styles.heroTitle}>
              {avatarConfig?.character_image_url
                ? 'Avatar ready for tutoring'
                : avatarConfig?.has_photo
                  ? 'Photo saved, avatar can be generated'
                  : 'Upload a photo to unlock the full tutor'}
            </Text>
            <Text style={styles.heroText}>
              Ask questions about Python, machine learning, AI, or data science and
              get text, voice, and animated video responses.
            </Text>
          </View>

          {avatarImageUrl ? (
            <Image source={{uri: avatarImageUrl}} style={styles.avatarPreview} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>Tutor</Text>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.actionBtn, styles.primaryBtn]}
            onPress={() => navigation.navigate('CourseSelection')}>
            <Text style={styles.primaryBtnText}>Choose course</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.actionBtn, styles.secondaryBtn]}
            onPress={() => openChat()}>
            <Text style={styles.secondaryBtnText}>Open chat</Text>
          </TouchableOpacity>
        </View>

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
                    {course.subject} · {course.difficulty_level}
                  </Text>
                </View>
                <Text style={styles.courseCta}>Start</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Need to update your avatar?</Text>
          <Text style={styles.cardText}>
            Use the Avatar tab to upload a new photo, regenerate the cartoon tutor,
            and preview a talking intro clip.
          </Text>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {color: '#FFFFFF', fontWeight: '700', fontSize: 18},
  refreshLink: {color: '#6C63FF', fontWeight: '700', fontSize: 13},
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  loadingText: {color: '#9CA3AF', fontSize: 14},
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
  cardText: {color: '#9CA3AF', fontSize: 14, lineHeight: 21, marginTop: 8},
});

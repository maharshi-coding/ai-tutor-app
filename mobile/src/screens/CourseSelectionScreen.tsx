import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NoticeBanner from '../components/NoticeBanner';
import {coursesAPI, extractErrorMessage} from '../services/api';
import {Course, TutorStackParamList} from '../types';

type Nav = NativeStackNavigationProp<TutorStackParamList, 'CourseSelection'>;
type SelectionRoute = RouteProp<TutorStackParamList, 'CourseSelection'>;

export default function CourseSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<SelectionRoute>();
  const mode = route.params?.mode ?? 'chat';
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [screenMessage, setScreenMessage] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setScreenMessage(null);

    try {
      const response = await coursesAPI.getAll();
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setScreenMessage(
        extractErrorMessage(error, 'Could not load the available courses.'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses().catch(() => {});
  }, [loadCourses]);

  const openCourse = (course: Course) =>
    navigation.navigate('TutorChat', {
      courseId: course.id,
      courseName: course.title,
      mode,
    });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {mode === 'liveTutor' ? 'Choose a live tutor course' : 'Choose a chat course'}
          </Text>
          <TouchableOpacity onPress={loadCourses} disabled={loading}>
            <Text style={styles.refreshLink}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <NoticeBanner message={screenMessage} style={styles.banner} />

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color="#6C63FF" />
            <Text style={styles.loadingText}>Loading courses...</Text>
          </View>
        ) : (
          <FlatList
            data={courses}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.courseCard}
                onPress={() => openCourse(item)}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.subject}</Text>
                </View>
                <Text style={styles.courseTitle}>{item.title}</Text>
                <Text style={styles.courseDesc} numberOfLines={3}>
                  {item.description}
                </Text>
                <Text style={styles.courseFoot}>
                  {item.difficulty_level} level ·{' '}
                  {mode === 'liveTutor' ? 'Open live tutor' : 'Open AI chat'}
                </Text>
              </TouchableOpacity>
            )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 16,
    gap: 12,
  },
  backLink: {color: '#94A3B8', fontWeight: '700', fontSize: 13},
  title: {color: '#FFFFFF', fontSize: 22, fontWeight: '800', flex: 1, textAlign: 'center'},
  refreshLink: {color: '#6C63FF', fontWeight: '700', fontSize: 13},
  banner: {marginBottom: 12},
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {color: '#9CA3AF', fontSize: 14},
  listContent: {paddingBottom: 28},
  courseCard: {
    backgroundColor: '#12122A',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E1E40',
    marginBottom: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E1B4B',
    borderWidth: 1,
    borderColor: '#3730A3',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  badgeText: {color: '#C7D2FE', fontSize: 11, fontWeight: '800'},
  courseTitle: {color: '#FFFFFF', fontSize: 18, fontWeight: '800'},
  courseDesc: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  courseFoot: {
    color: '#A5B4FC',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    textTransform: 'capitalize',
  },
});

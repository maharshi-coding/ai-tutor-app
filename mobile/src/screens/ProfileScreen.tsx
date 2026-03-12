import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  isCancel,
  pick,
  types as DocumentPickerTypes,
} from 'react-native-document-picker';
import NoticeBanner from '../components/NoticeBanner';
import {coursesAPI, extractErrorMessage, uploadAPI} from '../services/api';
import {useAuthStore} from '../store/authStore';
import {Course} from '../types';

export default function ProfileScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [screenMessage, setScreenMessage] = useState<string | null>(null);

  const loadCourses = async () => {
    setLoadingCourses(true);
    setScreenMessage(null);

    try {
      const response = await coursesAPI.getAll();
      const nextCourses = Array.isArray(response.data) ? response.data : [];
      setCourses(nextCourses);
      setSelectedCourse(current => current ?? nextCourses[0]?.id ?? null);
      setScreenMessage(
        nextCourses.length === 0
          ? 'No courses are available yet. Create one from the Home or Chat tab first.'
          : null,
      );
    } catch (error) {
      setScreenMessage(
        extractErrorMessage(error, 'Could not load your courses.'),
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  const uploadMaterial = async () => {
    if (!selectedCourse) {
      Alert.alert(
        'Select a course',
        'Please load your courses and choose one before uploading material.',
      );
      return;
    }

    try {
      const [file] = await pick({
        type: [
          DocumentPickerTypes.pdf,
          DocumentPickerTypes.plainText,
          DocumentPickerTypes.doc,
          DocumentPickerTypes.docx,
        ],
        allowMultiSelection: false,
      });

      setUploading(true);
      setScreenMessage(null);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type ?? 'application/pdf',
        name: file.name ?? 'document.pdf',
      } as unknown as Blob);
      formData.append('course_id', String(selectedCourse));

      await uploadAPI.uploadCourseDocument(formData, selectedCourse);
      setScreenMessage(
        `"${file.name ?? 'Document'}" was uploaded and is ready for tutoring.`,
      );
    } catch (error: unknown) {
      if (!isCancel(error)) {
        setScreenMessage(
          extractErrorMessage(error, 'Could not upload the selected file.'),
        );
      }
    } finally {
      setUploading(false);
    }
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

  const initial = (user?.full_name ?? user?.username ?? 'U')[0].toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInit}>{initial}</Text>
          </View>
          <Text style={styles.userName}>{user?.full_name ?? user?.username}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.badgeRow}>
            {user?.avatar_photo_path ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Photo uploaded</Text>
              </View>
            ) : null}
            {user?.voice_sample_path ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Voice uploaded</Text>
              </View>
            ) : null}
          </View>
        </View>

        <NoticeBanner
          message={screenMessage}
          tone={screenMessage?.includes('ready') ? 'success' : 'info'}
          style={styles.banner}
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Learning materials</Text>
          <Text style={styles.cardDesc}>
            Upload PDFs, DOCX, or TXT files so your AI tutor can answer from your own content.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.outlineBtn}
            onPress={loadCourses}
            disabled={loadingCourses}>
            {loadingCourses ? (
              <ActivityIndicator size="small" color="#6C63FF" />
            ) : (
              <Text style={styles.outlineBtnText}>Load my courses</Text>
            )}
          </TouchableOpacity>

          {courses.length > 0 ? (
            <View style={styles.courseList}>
              <Text style={styles.label}>Select a course for this material:</Text>
              {courses.map(course => (
                <TouchableOpacity
                  key={course.id}
                  activeOpacity={0.88}
                  style={[
                    styles.courseOption,
                    selectedCourse === course.id && styles.courseOptionSelected,
                  ]}
                  onPress={() => setSelectedCourse(course.id)}>
                  <Text
                    style={[
                      styles.courseOptionText,
                      selectedCourse === course.id &&
                        styles.courseOptionTextSelected,
                    ]}>
                    {course.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.btn,
              (!selectedCourse || uploading) && styles.btnOff,
            ]}
            onPress={uploadMaterial}
            disabled={!selectedCourse || uploading}>
            {uploading ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.btnText}>Uploading and indexing...</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>Upload study material</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.btn, styles.btnDanger]}
            onPress={handleLogout}>
            <Text style={[styles.btnText, styles.dangerText]}>Sign out</Text>
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
  profileCard: {
    backgroundColor: '#12122A',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E40',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  avatarInit: {fontSize: 36, color: '#A5B4FC', fontWeight: '700'},
  userName: {color: '#FFFFFF', fontSize: 20, fontWeight: '800'},
  userEmail: {color: '#6B7280', fontSize: 14, marginTop: 3},
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  badge: {
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#3730A3',
  },
  badgeText: {color: '#A5B4FC', fontSize: 12, fontWeight: '600'},
  banner: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#12122A',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E40',
  },
  cardTitle: {color: '#FFFFFF', fontWeight: '700', fontSize: 17, marginBottom: 6},
  cardDesc: {color: '#9CA3AF', fontSize: 14, lineHeight: 20, marginBottom: 16},
  label: {color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: 8},
  outlineBtn: {
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6C63FF',
    marginBottom: 14,
  },
  outlineBtnText: {color: '#6C63FF', fontWeight: '600'},
  courseList: {marginBottom: 14},
  courseOption: {
    backgroundColor: '#1C1C3A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  courseOptionSelected: {borderColor: '#6C63FF', backgroundColor: '#1E1B4B'},
  courseOptionText: {color: '#9CA3AF', fontWeight: '500', fontSize: 14},
  courseOptionTextSelected: {color: '#A5B4FC', fontWeight: '700'},
  btn: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  btnDanger: {backgroundColor: '#1C1C3A'},
  btnOff: {opacity: 0.5},
  btnRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  btnText: {color: '#FFFFFF', fontWeight: '700', fontSize: 15},
  dangerText: {color: '#EF4444'},
});

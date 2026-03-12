import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {pick, isCancel, types as DocumentPickerTypes} from 'react-native-document-picker';
import {useAuthStore} from '../store/authStore';
import {uploadAPI, coursesAPI} from '../services/api';
import {Course} from '../types';

export default function ProfileScreen() {
  const {user, logout} = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const r = await coursesAPI.getAll();
      setCourses(r.data);
    } catch {
      Alert.alert('Error', 'Could not load courses.');
    } finally {
      setLoadingCourses(false);
    }
  };

  const uploadMaterial = async () => {
    if (!selectedCourse) {
      Alert.alert(
        'Select a Course',
        'Please load courses and select one before uploading material.',
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
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type ?? 'application/pdf',
        name: file.name ?? 'document.pdf',
      } as unknown as Blob);

      await uploadAPI.uploadCourseDocument(formData, selectedCourse);
      Alert.alert(
        '✅ Uploaded',
        `"${file.name}" has been indexed and your AI tutor can now teach from it!`,
      );
    } catch (err: unknown) {
      if (!isCancel(err)) {
        Alert.alert(
          'Upload Failed',
          (err as any)?.response?.data?.detail ?? (err as Error)?.message ?? 'Could not upload the file.',
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () =>
    Alert.alert('Sign Out', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: logout},
    ]);

  const initial =
    (user?.full_name ?? user?.username ?? 'U')[0].toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}>
        {/* ── User card ───────────────────────────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInit}>{initial}</Text>
          </View>
          <Text style={styles.userName}>
            {user?.full_name ?? user?.username}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.badgeRow}>
            {user?.avatar_photo_path && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>📷 Photo uploaded</Text>
              </View>
            )}
            {user?.voice_sample_path && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🎤 Voice uploaded</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Upload learning materials ────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 Learning Materials</Text>
          <Text style={styles.cardDesc}>
            Upload PDFs, DOCX, or TXT files so your AI tutor can answer questions based on your content.
          </Text>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={loadCourses}
            disabled={loadingCourses}>
            {loadingCourses ? (
              <ActivityIndicator size="small" color="#6C63FF" />
            ) : (
              <Text style={styles.outlineBtnText}>Load My Courses</Text>
            )}
          </TouchableOpacity>

          {courses.length > 0 && (
            <View style={styles.courseList}>
              <Text style={styles.label}>Select course for this material:</Text>
              {courses.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.courseOption,
                    selectedCourse === c.id && styles.courseOptionSelected,
                  ]}
                  onPress={() => setSelectedCourse(c.id)}>
                  <Text
                    style={[
                      styles.courseOptionText,
                      selectedCourse === c.id && styles.courseOptionTextSelected,
                    ]}>
                    {c.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, uploading && styles.btnOff]}
            onPress={uploadMaterial}
            disabled={uploading}>
            {uploading ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.btnText}>Uploading & indexing...</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>+ Upload PDF / DOCX / TXT</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Account ──────────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Account</Text>
          <TouchableOpacity
            style={[styles.btn, styles.btnDanger]}
            onPress={handleLogout}>
            <Text style={[styles.btnText, {color: '#EF4444'}]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#0A0A1B'},
  container: {flex: 1, paddingHorizontal: 20},

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
});

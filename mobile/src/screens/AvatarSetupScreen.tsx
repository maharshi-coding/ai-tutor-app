import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';
import {uploadAPI} from '../services/api';
import {generateAndPollAvatar} from '../services/avatarService';
import {BASE_URL} from '../services/api';

type StepStatus = 'idle' | 'uploading' | 'polling' | 'done' | 'error';

export default function AvatarSetupScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [stepStatus, setStepStatus] = useState<StepStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const isWorking = stepStatus === 'uploading' || stepStatus === 'polling';

  // ── Load existing avatar config ──────────────────────────────────────────────
  useEffect(() => {
    uploadAPI
      .getAvatarConfig()
      .then(r => {
        if (r.data.has_photo) {
          setPhotoUploaded(true);
        }
        const clip: string | undefined = r.data.last_generated_clip_url;
        if (clip) {
          setVideoUrl(clip.startsWith('http') ? clip : `${BASE_URL}${clip}`);
          setStepStatus('done');
        }
      })
      .catch(() => {});
  }, []);

  // ── Pick photo from gallery ──────────────────────────────────────────────────
  const pickPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });
    const asset = result.assets?.[0];
    if (asset?.uri) {
      setPhotoUri(asset.uri);
      setPhotoUploaded(false);
      setVideoUrl(null);
      setStepStatus('idle');
    }
  };

  // ── Upload photo ─────────────────────────────────────────────────────────────
  const uploadPhoto = async () => {
    if (!photoUri) {
      return;
    }
    setStepStatus('uploading');
    setStatusMsg('Uploading photo...');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'avatar_photo.jpg',
      } as unknown as Blob);
      await uploadAPI.uploadPhoto(formData);
      setPhotoUploaded(true);
      setStepStatus('idle');
      setStatusMsg('');
      Alert.alert('✅ Photo Uploaded', 'Now tap "Generate Avatar" to create your talking avatar!');
    } catch (err: any) {
      setStepStatus('error');
      setStatusMsg('Upload failed');
      Alert.alert('Upload Failed', err.response?.data?.detail ?? 'Could not upload the photo.');
    }
  };

  // ── Generate avatar ───────────────────────────────────────────────────────────
  const generateAvatar = async () => {
    if (!photoUploaded) {
      Alert.alert('Upload Photo First', 'Please upload your photo before generating the avatar.');
      return;
    }
    setStepStatus('polling');
    setVideoUrl(null);
    try {
      const url = await generateAndPollAvatar(
        "Hello! I'm your AI tutor. I'm here to help you learn anything you want!",
        msg => setStatusMsg(msg),
      );
      const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
      setVideoUrl(fullUrl);
      setStepStatus('done');
      setStatusMsg('');
    } catch (err: any) {
      setStepStatus('error');
      setStatusMsg(err.message ?? 'Generation failed');
      Alert.alert('Avatar Failed', err.message ?? 'Could not generate avatar. Is SadTalker running?');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}>
        <Text style={styles.pageTitle}>Avatar Setup 🤖</Text>
        <Text style={styles.pageSub}>Create your personal talking AI tutor</Text>

        {/* ── STEP 1: Upload photo ─────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, photoUploaded && styles.stepDone]}>
              <Text style={styles.stepNum}>{photoUploaded ? '✓' : '1'}</Text>
            </View>
            <Text style={styles.stepTitle}>Upload Your Photo</Text>
          </View>
          <Text style={styles.stepDesc}>
            Use a clear, front-facing photo. This will be used to animate your talking avatar via SadTalker.
          </Text>

          <TouchableOpacity
            style={styles.photoBox}
            onPress={pickPhoto}
            disabled={isWorking}>
            {photoUri ? (
              <Image source={{uri: photoUri}} style={styles.photoImg} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={{fontSize: 44}}>📷</Text>
                <Text style={styles.photoPlaceholderText}>Tap to select a photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {photoUri && !photoUploaded && (
            <TouchableOpacity
              style={[styles.btn, isWorking && styles.btnOff]}
              onPress={uploadPhoto}
              disabled={isWorking}>
              {stepStatus === 'uploading' ? (
                <View style={styles.btnRow}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.btnText}>Uploading...</Text>
                </View>
              ) : (
                <Text style={styles.btnText}>Upload Photo</Text>
              )}
            </TouchableOpacity>
          )}

          {photoUploaded && (
            <View style={styles.successRow}>
              <Text style={styles.successText}>✅ Photo ready</Text>
            </View>
          )}
        </View>

        {/* ── STEP 2: Generate avatar ────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, stepStatus === 'done' && styles.stepDone]}>
              <Text style={styles.stepNum}>{stepStatus === 'done' ? '✓' : '2'}</Text>
            </View>
            <Text style={styles.stepTitle}>Generate Talking Avatar</Text>
          </View>
          <Text style={styles.stepDesc}>
            Our AI animates your photo using SadTalker to create a lip-synced talking avatar. This takes 1–3 minutes. A job is queued and you'll see the result when ready.
          </Text>

          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, (!photoUploaded || isWorking) && styles.btnOff]}
            onPress={generateAvatar}
            disabled={!photoUploaded || isWorking}>
            {isWorking ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.btnText}>{statusMsg || 'Processing...'}</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>🚀 Generate Avatar</Text>
            )}
          </TouchableOpacity>

          {stepStatus === 'error' && statusMsg ? (
            <Text style={styles.errorText}>{statusMsg}</Text>
          ) : null}
        </View>

        {/* ── STEP 3: Preview ────────────────────────────────────────────── */}
        {videoUrl && (
          <View style={styles.card}>
            <Text style={styles.stepTitle}>🎉 Your Avatar is Ready!</Text>
            <Text style={styles.stepDesc}>
              This avatar will appear in the chat screen when your AI tutor responds.
            </Text>
            <View style={styles.videoWrapper}>
              <Video
                source={{uri: videoUrl}}
                style={styles.video}
                controls
                resizeMode="cover"
                repeat
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#0A0A1B'},
  container: {flex: 1, paddingHorizontal: 20},
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 4,
  },
  pageSub: {color: '#6B7280', marginBottom: 22, fontSize: 14},

  card: {
    backgroundColor: '#12122A',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E40',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: {backgroundColor: '#059669'},
  stepNum: {color: '#FFFFFF', fontWeight: '700', fontSize: 14},
  stepTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
    flex: 1,
  },
  stepDesc: {color: '#9CA3AF', fontSize: 14, lineHeight: 21, marginBottom: 16},

  photoBox: {
    height: 210,
    backgroundColor: '#1C1C3A',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#2A2A4A',
    marginBottom: 14,
  },
  photoImg: {width: '100%', height: '100%', resizeMode: 'cover'},
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  photoPlaceholderText: {color: '#6B7280', fontSize: 14},

  btn: {
    backgroundColor: '#2A2A4A',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  btnPrimary: {backgroundColor: '#6C63FF'},
  btnOff: {opacity: 0.5},
  btnRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  btnText: {color: '#FFFFFF', fontWeight: '700', fontSize: 15},
  successRow: {alignItems: 'flex-start', marginTop: 4},
  successText: {color: '#10B981', fontWeight: '600', fontSize: 14},
  errorText: {color: '#EF4444', fontSize: 13, marginTop: 8, textAlign: 'center'},

  videoWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 270,
    backgroundColor: '#000',
  },
  video: {width: '100%', height: '100%'},
});

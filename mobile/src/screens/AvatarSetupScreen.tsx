import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import Video from 'react-native-video';
import NoticeBanner from '../components/NoticeBanner';
import {avatarAPI, extractErrorMessage, getApiBaseUrl, uploadAPI} from '../services/api';
import {generateAndPollAvatar} from '../services/avatarService';
import {useAuthStore} from '../store/authStore';
import {AvatarConfig} from '../types';

type StepStatus = 'idle' | 'uploading' | 'polling' | 'done' | 'error';

export default function AvatarSetupScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [stepStatus, setStepStatus] = useState<StepStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [screenMessage, setScreenMessage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const refreshCurrentUser = useAuthStore(state => state.refreshCurrentUser);

  const isWorking = stepStatus === 'uploading' || stepStatus === 'polling';

  const hydrateFromConfig = useCallback(async (config: AvatarConfig) => {
    setPhotoUploaded(Boolean(config.has_photo));
    setAvatarId(config.avatar_ready ? config.avatar_id ?? null : null);

    const avatarImage =
      config.avatar_image_url || config.character_image_url || config.photo_path;
    if (avatarImage) {
      const baseUrl = await getApiBaseUrl();
      setAvatarImageUrl(
        avatarImage.startsWith('http') ? avatarImage : `${baseUrl}${avatarImage}`,
      );
    } else {
      setAvatarImageUrl(null);
    }

    const clip = config.last_generated_clip_url;
    if (clip) {
      const baseUrl = await getApiBaseUrl();
      setVideoUrl(clip.startsWith('http') ? clip : `${baseUrl}${clip}`);
    } else {
      setVideoUrl(null);
    }
  }, []);

  const loadAvatarConfig = useCallback(async () => {
    setIsLoadingConfig(true);

    try {
      const response = await uploadAPI.getAvatarConfig();
      await hydrateFromConfig(response.data as AvatarConfig);
      setScreenMessage(null);
    } catch {
      setScreenMessage('Could not load your saved avatar settings.');
    } finally {
      setIsLoadingConfig(false);
    }
  }, [hydrateFromConfig]);

  useEffect(() => {
    loadAvatarConfig().catch(() => {});
  }, [loadAvatarConfig]);

  const pickPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorMessage) {
      Alert.alert('Photo selection failed', result.errorMessage);
      return;
    }

    const asset = result.assets?.[0];

    if (asset?.uri) {
      setPhotoUri(asset.uri);
      setPhotoUploaded(false);
      setAvatarId(null);
      setVideoUrl(null);
      setAvatarImageUrl(asset.uri);
      setStepStatus('idle');
      setStatusMessage('');
      setScreenMessage(null);
    }
  };

  const uploadPhoto = async () => {
    if (!photoUri) {
      return;
    }

    setStepStatus('uploading');
    setStatusMessage('Uploading photo and creating D-ID avatar...');
    setScreenMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'avatar_photo.jpg',
      } as unknown as Blob);

      const response = await avatarAPI.create(formData);
      await refreshCurrentUser();
      setPhotoUploaded(true);
      setAvatarId(response.data.avatar_id);
      setStepStatus('idle');
      setStatusMessage('');
      setScreenMessage(response.data.message);
      await loadAvatarConfig();
    } catch (error) {
      setStepStatus('error');
      setStatusMessage('Upload failed');
      setScreenMessage(
        extractErrorMessage(
          error,
          'Could not create the D-ID avatar from the selected photo.',
        ),
      );
      await loadAvatarConfig();
    }
  };

  const generateAvatarPreview = async () => {
    if (!avatarId) {
      Alert.alert(
        'Create an avatar first',
        'Please upload your photo and finish D-ID avatar setup before generating a preview.',
      );
      return;
    }

    setStepStatus('polling');
    setStatusMessage('Preparing tutor intro video...');
    setScreenMessage(null);

    try {
      const relativeUrl = await generateAndPollAvatar(
        avatarId,
        'Hello. I am your live AI tutor, and I am ready to teach step by step.',
        message => setStatusMessage(message),
      );
      const baseUrl = await getApiBaseUrl();
      const fullUrl = relativeUrl.startsWith('http')
        ? relativeUrl
        : `${baseUrl}${relativeUrl}`;
      setVideoUrl(fullUrl);
      setStepStatus('done');
      setStatusMessage('');
      setScreenMessage('Live Tutor preview generated successfully.');
      await loadAvatarConfig();
    } catch (error) {
      setStepStatus('error');
      setStatusMessage('');
      setScreenMessage(
        extractErrorMessage(
          error,
          'Could not generate the Live Tutor preview video.',
        ),
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

      <Text style={styles.pageTitle}>Avatar setup</Text>
      <Text style={styles.pageSub}>
        Upload a photo once, cache the D-ID avatar for your account, and preview the live tutor video pipeline.
      </Text>

      {isLoadingConfig ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color="#6C63FF" />
          <Text style={styles.loadingText}>Loading saved avatar settings...</Text>
        </View>
      ) : null}

      <NoticeBanner
        message={screenMessage}
        tone={stepStatus === 'error' ? 'error' : 'info'}
        style={styles.banner}
      />

      <View style={styles.card}>
        <View style={styles.stepRow}>
          <View style={[styles.stepBadge, photoUploaded && styles.stepDone]}>
            <Text style={styles.stepNum}>{photoUploaded ? 'OK' : '1'}</Text>
          </View>
          <Text style={styles.stepTitle}>Upload your tutor photo</Text>
        </View>
        <Text style={styles.stepDesc}>
          Use a clear, front-facing image. The same uploaded photo is cached and reused for D-ID avatar generation.
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.photoBox}
          onPress={pickPhoto}
          disabled={isWorking}>
          {avatarImageUrl ? (
            <Image source={{uri: avatarImageUrl}} style={styles.photoImg} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderTitle}>Select a photo</Text>
              <Text style={styles.photoPlaceholderText}>
                Tap here to choose the image you want to use for your Live Tutor.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.btn,
            styles.btnPrimary,
            (!photoUri || isWorking) && styles.btnOff,
          ]}
          onPress={uploadPhoto}
          disabled={!photoUri || isWorking}>
          {stepStatus === 'uploading' ? (
            <View style={styles.btnRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.btnText}>Creating avatar...</Text>
            </View>
          ) : (
            <Text style={styles.btnText}>
              {avatarId ? 'Refresh D-ID avatar' : 'Create D-ID avatar'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.stepRow}>
          <View style={[styles.stepBadge, avatarId && styles.stepDone]}>
            <Text style={styles.stepNum}>{avatarId ? 'OK' : '2'}</Text>
          </View>
          <Text style={styles.stepTitle}>Live Tutor status</Text>
        </View>
        <Text style={styles.stepDesc}>
          {avatarId
            ? 'Your D-ID avatar is cached and ready. You only need to regenerate it when you upload a new photo.'
            : 'After the photo upload completes, the backend stores the D-ID avatar id for reuse.'}
        </Text>

        <View style={styles.statusPanel}>
          <Text style={styles.statusLabel}>Avatar provider</Text>
          <Text style={styles.statusValue}>{avatarId ? 'D-ID ready' : 'Waiting for setup'}</Text>
          {avatarId ? (
            <Text style={styles.statusMeta}>Avatar ID: {avatarId}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.stepRow}>
          <View style={[styles.stepBadge, stepStatus === 'done' && styles.stepDone]}>
            <Text style={styles.stepNum}>{stepStatus === 'done' ? 'OK' : '3'}</Text>
          </View>
          <Text style={styles.stepTitle}>Generate intro preview</Text>
        </View>
        <Text style={styles.stepDesc}>
          This creates a short talking tutor video using the same D-ID avatar flow that Live Tutor mode uses after each lesson response.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.btn,
            styles.btnPrimary,
            (!avatarId || isWorking) && styles.btnOff,
          ]}
          onPress={generateAvatarPreview}
          disabled={!avatarId || isWorking}>
          {isWorking ? (
            <View style={styles.btnRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.btnText}>{statusMessage || 'Processing...'}</Text>
            </View>
          ) : (
            <Text style={styles.btnText}>Generate preview video</Text>
          )}
        </TouchableOpacity>
      </View>

        {videoUrl ? (
          <View style={styles.card}>
            <Text style={styles.stepTitle}>Preview video</Text>
            <Text style={styles.stepDesc}>
              This is the same kind of talking response users will see in Live Tutor mode after the AI generates an explanation.
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
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#0A0A1B'},
  content: {paddingHorizontal: 20, paddingBottom: 40},
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 4,
  },
  pageSub: {color: '#6B7280', marginBottom: 18, fontSize: 14, lineHeight: 20},
  loadingCard: {
    backgroundColor: '#12122A',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E1E40',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  banner: {
    marginBottom: 14,
  },
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
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A4A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  stepDone: {backgroundColor: '#059669'},
  stepNum: {color: '#FFFFFF', fontWeight: '700', fontSize: 12},
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
    paddingHorizontal: 20,
  },
  photoPlaceholderTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  photoPlaceholderText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  statusPanel: {
    backgroundColor: '#1B1B34',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#25254A',
  },
  statusLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  statusMeta: {
    color: '#A5B4FC',
    fontSize: 12,
    marginTop: 6,
  },
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
  videoWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 270,
    backgroundColor: '#000000',
  },
  video: {width: '100%', height: '100%'},
});

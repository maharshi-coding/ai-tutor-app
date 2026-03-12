import React, {useEffect, useState} from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';
import {launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';
import NoticeBanner from '../components/NoticeBanner';
import {BASE_URL, extractErrorMessage, uploadAPI} from '../services/api';
import {generateAndPollAvatar} from '../services/avatarService';

type StepStatus = 'idle' | 'uploading' | 'polling' | 'done' | 'error';

export default function AvatarSetupScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [stepStatus, setStepStatus] = useState<StepStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [screenMessage, setScreenMessage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  const isWorking = stepStatus === 'uploading' || stepStatus === 'polling';

  useEffect(() => {
    let isMounted = true;

    const loadAvatarConfig = async () => {
      try {
        const response = await uploadAPI.getAvatarConfig();

        if (!isMounted) {
          return;
        }

        if (response.data.has_photo) {
          setPhotoUploaded(true);
          setScreenMessage('A photo is already saved for this account.');
        }

        const clip = response.data.last_generated_clip_url as string | undefined;

        if (clip) {
          setVideoUrl(clip.startsWith('http') ? clip : `${BASE_URL}${clip}`);
          setStepStatus('done');
        }
      } catch {
        if (isMounted) {
          setScreenMessage('Could not load your saved avatar configuration.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingConfig(false);
        }
      }
    };

    loadAvatarConfig().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

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
      setVideoUrl(null);
      setStepStatus('idle');
      setScreenMessage(null);
    }
  };

  const uploadPhoto = async () => {
    if (!photoUri) {
      return;
    }

    setStepStatus('uploading');
    setStatusMessage('Uploading photo...');
    setScreenMessage(null);

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
      setStatusMessage('');
      setScreenMessage('Photo uploaded. You can generate a talking avatar now.');
    } catch (error) {
      setStepStatus('error');
      setStatusMessage('Upload failed');
      setScreenMessage(
        extractErrorMessage(error, 'Could not upload the selected photo.'),
      );
    }
  };

  const generateAvatar = async () => {
    if (!photoUploaded) {
      Alert.alert(
        'Upload a photo first',
        'Please upload your photo before generating the avatar.',
      );
      return;
    }

    setStepStatus('polling');
    setStatusMessage('Preparing avatar...');
    setScreenMessage(null);

    try {
      const url = await generateAndPollAvatar(
        'Hello. I am your AI tutor and I am ready to help you learn.',
        message => setStatusMessage(message),
      );
      const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
      setVideoUrl(fullUrl);
      setStepStatus('done');
      setStatusMessage('');
      setScreenMessage('Avatar generated successfully.');
    } catch (error) {
      setStepStatus('error');
      setStatusMessage('');
      setScreenMessage(
        extractErrorMessage(
          error,
          'Could not generate the avatar. Make sure the avatar backend is running.',
        ),
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Avatar setup</Text>
        <Text style={styles.pageSub}>Create your personal talking AI tutor.</Text>

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
            <Text style={styles.stepTitle}>Upload your photo</Text>
          </View>
          <Text style={styles.stepDesc}>
            Use a clear, front-facing image. It will be used to animate your tutor avatar.
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.photoBox}
            onPress={pickPhoto}
            disabled={isWorking}>
            {photoUri ? (
              <Image source={{uri: photoUri}} style={styles.photoImg} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderTitle}>Select a photo</Text>
                <Text style={styles.photoPlaceholderText}>
                  Tap here to choose the image you want to animate.
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {photoUri && !photoUploaded ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.btn, isWorking && styles.btnOff]}
              onPress={uploadPhoto}
              disabled={isWorking}>
              {stepStatus === 'uploading' ? (
                <View style={styles.btnRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.btnText}>Uploading...</Text>
                </View>
              ) : (
                <Text style={styles.btnText}>Upload photo</Text>
              )}
            </TouchableOpacity>
          ) : null}

          {photoUploaded ? (
            <View style={styles.successRow}>
              <Text style={styles.successText}>Photo ready for avatar generation</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, stepStatus === 'done' && styles.stepDone]}>
              <Text style={styles.stepNum}>{stepStatus === 'done' ? 'OK' : '2'}</Text>
            </View>
            <Text style={styles.stepTitle}>Generate talking avatar</Text>
          </View>
          <Text style={styles.stepDesc}>
            Rendering usually takes one to three minutes. The preview will update when it is ready.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.btn,
              styles.btnPrimary,
              (!photoUploaded || isWorking) && styles.btnOff,
            ]}
            onPress={generateAvatar}
            disabled={!photoUploaded || isWorking}>
            {isWorking ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.btnText}>{statusMessage || 'Processing...'}</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>Generate avatar</Text>
            )}
          </TouchableOpacity>
        </View>

        {videoUrl ? (
          <View style={styles.card}>
            <Text style={styles.stepTitle}>Avatar preview</Text>
            <Text style={styles.stepDesc}>
              This video will also be reused on the chat screen for tutor responses.
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
  container: {flex: 1, paddingHorizontal: 20},
  content: {paddingBottom: 40},
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 4,
  },
  pageSub: {color: '#6B7280', marginBottom: 18, fontSize: 14},
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
  videoWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 270,
    backgroundColor: '#000000',
  },
  video: {width: '100%', height: '100%'},
});

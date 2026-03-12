import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuthStore} from '../store/authStore';
import {RootStackParamList} from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const {width} = Dimensions.get('window');

export default function SplashScreen() {
  const nav = useNavigation<Nav>();
  const {isAuthenticated, isLoading} = useAuthStore();

  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 6,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {toValue: 1, duration: 1200, useNativeDriver: true}),
        Animated.timing(glowAnim, {toValue: 0, duration: 1200, useNativeDriver: true}),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const timer = setTimeout(() => {
      nav.replace(isAuthenticated ? 'Main' : 'Login');
    }, 2200);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, nav]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#3730A3', '#818CF8'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />

      <Animated.View
        style={[
          styles.logoWrap,
          {transform: [{scale: scaleAnim}], opacity: opacityAnim},
        ]}>
        <Animated.View style={[styles.iconRing, {borderColor}]}>
          <Text style={styles.iconEmoji}>🎓</Text>
        </Animated.View>
        <Text style={styles.title}>AI Tutor</Text>
        <Text style={styles.subtitle}>Your Personal Learning Companion</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, {opacity: opacityAnim}]}>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[styles.dot, {opacity: 0.3 + i * 0.3}]}
            />
          ))}
        </View>
        <Text style={styles.tagline}>Powered by AI · Personalized for You</Text>
      </Animated.View>

      {/* Decorative background blobs */}
      <View style={[styles.blob, {top: -60, left: -60, backgroundColor: '#1E1B4B'}]} />
      <View style={[styles.blob, {bottom: -80, right: -60, backgroundColor: '#0F172A'}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1B',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoWrap: {
    alignItems: 'center',
  },
  iconRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2.5,
    backgroundColor: '#12122A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 52,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B82A0',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    gap: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6C63FF',
  },
  tagline: {
    color: '#374151',
    fontSize: 13,
  },
  blob: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    zIndex: -1,
  },
});

import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Video from 'react-native-video';
import {TutorStackParamList} from '../types';

type PlayerRoute = RouteProp<TutorStackParamList, 'AvatarVideoPlayer'>;
type Nav = NativeStackNavigationProp<TutorStackParamList, 'AvatarVideoPlayer'>;

export default function AvatarVideoPlayerScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<PlayerRoute>();
  const {videoUrl, title} = route.params;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title || 'Tutor video'}
        </Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.playerShell}>
        <Video
          source={{uri: videoUrl}}
          style={styles.video}
          controls
          resizeMode="contain"
          repeat
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#000000'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backText: {color: '#C7D2FE', fontSize: 14, fontWeight: '700'},
  title: {color: '#FFFFFF', fontSize: 16, fontWeight: '700'},
  spacer: {width: 40},
  playerShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

type NoticeTone = 'error' | 'info' | 'success';

interface NoticeBannerProps {
  message?: string | null;
  tone?: NoticeTone;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const toneStyles: Record<
  NoticeTone,
  {
    container: ViewStyle;
    text: TextStyle;
  }
> = {
  error: {
    container: {
      backgroundColor: '#2A1217',
      borderColor: '#7F1D1D',
    },
    text: {
      color: '#FECACA',
    },
  },
  info: {
    container: {
      backgroundColor: '#111C32',
      borderColor: '#1D4ED8',
    },
    text: {
      color: '#BFDBFE',
    },
  },
  success: {
    container: {
      backgroundColor: '#10251B',
      borderColor: '#047857',
    },
    text: {
      color: '#A7F3D0',
    },
  },
};

export default function NoticeBanner({
  message,
  tone = 'error',
  style,
  textStyle,
}: NoticeBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <View style={[styles.container, toneStyles[tone].container, style]}>
      <Text style={[styles.text, toneStyles[tone].text, textStyle]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
});

import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ServerUrlModalProps {
  visible: boolean;
  currentValue: string;
  onClose: () => void;
  onSave: (value: string) => Promise<void>;
  onReset: () => Promise<void>;
}

export default function ServerUrlModal({
  visible,
  currentValue,
  onClose,
  onSave,
  onReset,
}: ServerUrlModalProps) {
  const [value, setValue] = useState(currentValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setValue(currentValue);
    }
  }, [currentValue, visible]);

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      await onSave(value);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    setIsSubmitting(true);

    try {
      await onReset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Server URL</Text>
          <Text style={styles.subtitle}>
            Use this when your backend is running on a LAN IP instead of the default detected address.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="http://192.168.1.50:8000"
            placeholderTextColor="#4B5563"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            value={value}
            onChangeText={setValue}
            editable={!isSubmitting}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.secondaryButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={isSubmitting}>
              <Text style={styles.secondaryText}>Use auto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
  },
  sheet: {
    backgroundColor: '#12122A',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1E1E40',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  input: {
    marginTop: 18,
    backgroundColor: '#1C1C3A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3730A3',
    backgroundColor: '#161630',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  secondaryText: {
    color: '#C7D2FE',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

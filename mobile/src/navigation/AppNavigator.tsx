import React, {useEffect} from 'react';
import {DarkTheme, NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StyleSheet, Text, View} from 'react-native';
import {useAuthStore} from '../store/authStore';
import {
  MainTabParamList,
  RootStackParamList,
  TutorStackParamList,
} from '../types';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import AvatarSetupScreen from '../screens/AvatarSetupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AvatarTutorScreen from '../screens/AvatarTutorScreen';
import CourseSelectionScreen from '../screens/CourseSelectionScreen';
import AvatarVideoPlayerScreen from '../screens/AvatarVideoPlayerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const TutorStack = createNativeStackNavigator<TutorStackParamList>();
const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  Home: 'HM',
  Chat: 'AI',
  Avatar: 'AV',
  Profile: 'ME',
};

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#6C63FF',
    background: '#0A0A1B',
    card: '#0D0D24',
    text: '#FFFFFF',
    border: '#1C1C3A',
    notification: '#6C63FF',
  },
};

function TabIcon({
  label,
  color,
  focused,
}: {
  label: string;
  color: string;
  focused: boolean;
}) {
  return (
    <View
      style={[
        styles.tabIcon,
        focused && styles.tabIconFocused,
        focused ? styles.tabIconActiveBorder : styles.tabIconIdleBorder,
      ]}>
      <Text style={[styles.tabIconText, {color}]}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      sceneContainerStyle={styles.sceneContainer}
      screenOptions={({route}) => ({
        tabBarIcon: ({color, focused}) => (
          <TabIcon
            label={TAB_LABELS[route.name]}
            color={color}
            focused={focused}
          />
        ),
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Chat"
        component={TutorNavigator}
        options={{tabBarLabel: 'Ask AI'}}
      />
      <Tab.Screen
        name="Avatar"
        component={AvatarSetupScreen}
        options={{tabBarLabel: 'Avatar'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
}

function TutorNavigator() {
  return (
    <TutorStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: styles.stackContent,
      }}>
      <TutorStack.Screen name="AvatarTutor" component={AvatarTutorScreen} />
      <TutorStack.Screen
        name="CourseSelection"
        component={CourseSelectionScreen}
      />
      <TutorStack.Screen name="TutorChat" component={ChatScreen} />
      <TutorStack.Screen
        name="AvatarVideoPlayer"
        component={AvatarVideoPlayerScreen}
      />
    </TutorStack.Navigator>
  );
}

export default function AppNavigator() {
  const bootstrapAuth = useAuthStore(state => state.bootstrapAuth);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isBootstrapping = useAuthStore(state => state.isBootstrapping);

  useEffect(() => {
    bootstrapAuth().catch(() => {});
  }, [bootstrapAuth]);

  if (isBootstrapping) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: styles.stackContent,
        }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  stackContent: {
    backgroundColor: '#0A0A1B',
  },
  sceneContainer: {
    backgroundColor: '#0A0A1B',
  },
  tabBar: {
    backgroundColor: '#0D0D24',
    borderTopColor: '#1C1C3A',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabItem: {
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 0,
  },
  tabIcon: {
    minWidth: 38,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconFocused: {
    backgroundColor: '#171733',
  },
  tabIconActiveBorder: {
    borderColor: '#6C63FF',
  },
  tabIconIdleBorder: {
    borderColor: '#2A2A4A',
  },
  tabIconText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet} from 'react-native';
import {useAuthStore} from '../store/authStore';
import {RootStackParamList, MainTabParamList} from '../types';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import AvatarSetupScreen from '../screens/AvatarSetupScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Inline icon component to avoid vector-icon native setup requirement
function TabIcon({name, color}: {name: string; color: string}) {
  const icons: Record<string, string> = {
    Home: '🏠',
    Chat: '💬',
    Avatar: '🤖',
    Profile: '👤',
  };
  return (
    <Text style={{fontSize: 22, color, opacity: color === '#6C63FF' ? 1 : 0.5}}>
      {icons[name] ?? '●'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}: {route: {name: string}}) => ({
        tabBarIcon: ({color}: {color: string}) => (
          <TabIcon name={route.name} color={color} />
        ),
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#4B5563',
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
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

export default function AppNavigator() {
  const {isAuthenticated, fetchUser} = useAuthStore();

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false, animation: 'fade'}}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0D0D24',
    borderTopColor: '#1C1C3A',
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 4,
    height: 64,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: -2,
  },
});

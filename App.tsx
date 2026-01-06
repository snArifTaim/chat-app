import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import LoginScreen from './screens/LoginScreen';
import UsersListScreen from './screens/UsersListScreen';
import ChatScreen from './screens/ChatScreen';
import RecentChatsScreen from './screens/RecentChatsScreen';
import { ActivityIndicator, View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Suppress the specialized expo-notifications warning in Expo Go
LogBox.ignoreLogs(['expo-notifications']);

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen name="UsersList" component={UsersListScreen} />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="RecentChats" component={RecentChatsScreen} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

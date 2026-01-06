import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';

const LoginScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Get push token (optional, don't block login if it fails)
      let pushToken = '';
      try {
        const token = await Notifications.getExpoPushTokenAsync();
        pushToken = token.data;
      } catch (e) {
        console.log('Failed to get push token:', e);
      }

      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || `User ${user.uid.slice(0, 5)}`,
        pushToken: pushToken,
      });

      Toast.show({
        type: 'success',
        text1: 'Logged in successfully',
      });
      navigation.replace('UsersList');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: (error as Error).message,
      });
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Chat App</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin} accessibilityLabel="Login button">
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default LoginScreen;
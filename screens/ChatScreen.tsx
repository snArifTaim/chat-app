import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import {
  GiftedChat,
  IMessage,
  Send,
  InputToolbar,
  Composer,
  Message,
  Bubble,
} from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLayoutEffect } from 'react';

const ChatScreen = ({ route, navigation }: any) => {
  const { user } = route.params;
  const currentUser = auth.currentUser;
  const insets = useSafeAreaInsets();

  if (!currentUser) return null;

  const chatId = [currentUser.uid, user.id].sort().join('_');

  const [messages, setMessages] = useState<IMessage[]>([]);

  // 🔹 Set Header Title
  useLayoutEffect(() => {
    navigation.setOptions({
      title: user.name || 'Chat',
    });
  }, [navigation, user.name]);

  // 🔹 Listen messages
  useEffect(() => {
    const messagesRef = collection(db, 'messages', chatId, 'msgs');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`[ChatScreen] Snapshot received: ${snapshot.docs.length} docs`);

      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        // Safe timestamp conversion
        const createdAt = data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate()
          : new Date(); // Fallback to now if missing/invalid

        return {
          _id: doc.id,
          text: data.text || ' ', // Fallback to space if empty to ensure render
          createdAt: createdAt,
          user: {
            _id: data.user?._id || 'unknown',
            name: data.user?.name || 'Unknown',
          },
        };
      });

      setMessages(msgs);
    });

    return unsubscribe;
  }, [chatId]);

  // 🔹 Push notification
  const sendPushNotification = async (token: string, message: string) => {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title: 'New Message',
        body: message,
        data: { chatId },
      }),
    });
  };

  // 🔹 Send message
  const onSend = useCallback(
    async (msgs: IMessage[] = []) => {
      const { _id, text, createdAt, user: msgUser } = msgs[0];

      try {
        await addDoc(collection(db, 'messages', chatId, 'msgs'), {
          _id,
          text,
          createdAt,
          user: msgUser,
        });

        const otherUserDoc = await getDoc(doc(db, 'users', user.id));
        if (otherUserDoc.exists()) {
          const pushToken = otherUserDoc.data().pushToken;
          if (pushToken) {
            await sendPushNotification(pushToken, text);
          }
        }
      } catch (e) {
        Toast.show({
          type: 'error',
          text1: 'Failed to send message',
        });
      }
    },
    [chatId, user.id]
  );



  // 🔹 Render send button
  const renderSend = (props: any) => {
    const { key, ...rest } = props;
    return (
      <Send key={key} {...rest} sendButtonProps={{ accessibilityLabel: 'Send button' }}>
        <View style={{ marginRight: 10, marginBottom: 5 }}>
          <Text style={{ color: '#007AFF', fontWeight: '600', fontSize: 16 }}>
            Send
          </Text>
        </View>
      </Send>
    );
  };

  // 🔹 Input toolbar
  const renderInputToolbar = (props: any) => {
    const { key, ...rest } = props;
    return (
      <InputToolbar
        key={key}
        {...rest}
        containerStyle={{
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
        }}
      />
    );
  };

  // 🔹 Composer
  const renderComposer = (props: any) => {
    const { key, ...rest } = props;
    return (
      <Composer
        key={key}
        {...rest}
        textInputStyle={{
          color: '#000',
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 20,
          paddingHorizontal: 12,
          marginTop: 5,
          marginBottom: 5,
        }}
      />
    );
  };

  // 🔹 Message
  const renderMessage = (props: any) => {
    const { key, ...rest } = props;
    return <Message key={key} {...rest} />;
  };

  // 🔹 Bubble
  const renderBubble = (props: any) => {
    const { key, ...rest } = props;
    return <Bubble key={key} {...rest} />;
  };

  const content = (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{
        _id: currentUser.uid,
        name:
          currentUser.displayName ||
          `User ${currentUser.uid.slice(0, 5)}`,
      }}
      placeholder="Type a message..."
      alwaysShowSend
      infiniteScroll
      inverted={true}

      // Android: use system resize (set in app.json) + NO internal handling
      isKeyboardInternallyHandled={Platform.OS !== 'android'}
      bottomOffset={Platform.OS === 'ios' ? insets.bottom : 0}
      forceGetKeyboardHeight={false}

      renderSend={renderSend}
      renderInputToolbar={renderInputToolbar}
      renderComposer={renderComposer}
      renderBubble={renderBubble}
      renderMessage={renderMessage}
      renderLoading={() => (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    />
  );

  // Wrap in KeyboardAvoidingView for BOTH platforms to force visibility
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 100} // Higher offset for Android header
      >
        {content}
      </KeyboardAvoidingView>
      <Toast />
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

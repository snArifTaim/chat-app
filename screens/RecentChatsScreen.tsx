import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: Date;
}

const RecentChatsScreen = ({ navigation }: any) => {
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchRecentChats = async () => {
        setLoading(true);
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) return;

          const usersSnapshot = await getDocs(collection(db, 'users'));
          console.log(`[RecentChats] Found ${usersSnapshot.docs.length} users to scan in DB.`);
          const chats: Chat[] = [];

          for (const userDoc of usersSnapshot.docs) {
            const otherUser = { id: userDoc.id, name: userDoc.data().name || 'Unknown' };
            if (otherUser.id === currentUser.uid) continue;

            const chatId = [currentUser.uid, otherUser.id].sort().join('_');
            const messagesRef = collection(db, 'messages', chatId, 'msgs');
            const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
            const lastMsgSnapshot = await getDocs(q);

            if (!lastMsgSnapshot.empty) {
              const lastMsgDoc = lastMsgSnapshot.docs[0].data();
              const createdAt = lastMsgDoc.createdAt;

              chats.push({
                id: chatId,
                name: otherUser.name,
                lastMessage: lastMsgDoc.text || '',
                time: createdAt && typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(),
              });
            }
          }

          // Sort by time descending
          chats.sort((a, b) => b.time.getTime() - a.time.getTime());
          setRecentChats(chats);
        } catch (error) {
          console.error("Error fetching recent chats:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRecentChats();
    }, [])
  );

  const renderChat = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const otherId = item.id.split('_').find((id: string) => id !== currentUser.uid);
        navigation.navigate('Chat', { user: { id: otherId, name: item.name } });
      }}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.time}>{item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Chats</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={recentChats}
          renderItem={renderChat}
          keyExtractor={(item: any) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recent chats yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 16,
    color: '#666',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default RecentChatsScreen;
# Simple Chat App
A React Native chat application using Firebase for real-time messaging.

## Features

- User authentication (Anonymous login)
- Real-time chat with GiftedChat
- Push notifications
- Recent chats list
- Responsive UI

## Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Anonymous sign-in)
3. Enable Firestore Database
4. Enable Cloud Messaging (FCM)
5. Get your Firebase config and replace in `firebase.js`
6. For push notifications, in Firebase console, go to Project Settings > Cloud Messaging > Server key, and note it for Expo (though using Expo push API)

## Installation

```bash
git clone https://github.com/snArifTaim/chat-app.git
cd TodoNotesApp
npm install
```

## Running the App

```bash
npm start
# Then press 'a' for Android emulator or 'i' for iOS
```

## Building APK

```bash
expo login
expo build:android --type apk
```

## Author

MD. Arif Islam
- 📱 Mobile App Developer (React Native & Expo)
- 🚀 Crafting modern, user-friendly & high-performance mobile apps fast!

 🔗 [GitHub](https://github.com/snArifTaim/) [LinkedIn](https://www.linkedin.com/in/sn-arif-dev/)

## Notes

- Uses Expo for simplicity
- For FCM, configure server key in Expo dashboard if needed
- Users are hardcoded for demo; in production, add via Firestore#

import React, { useContext, useEffect } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { AuthContext, AuthProvider } from '@/hooks/authContext';
import { useRouter } from 'expo-router';
import { SOSChoicesProvider } from '@/hooks/sosServicesContext';

function Home() {
  const { token, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (token) {
      router.push('/home');
    } else {
      router.push('/onbording');
    }
  }, [loading, token, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <SOSChoicesProvider>
        <Home />
      </SOSChoicesProvider>
    </AuthProvider>
  );
}


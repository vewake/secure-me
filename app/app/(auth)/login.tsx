import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import ApiConstants from '@/constants/apiConstants';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '@/hooks/authContext';

const LoginScreen = () => {
  const { login, token } = useContext(AuthContext)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        setIsLoggedIn(true);
      }
    };
    checkToken();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    if (!email || !password) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }


    try {
      const response = await axios.post(ApiConstants.LOGIN_URL, { email, password });
      const { token } = response.data;
      login(token);
      await AsyncStorage.setItem('token', token);
      setIsLoggedIn(true);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return <Redirect href="/" />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default LoginScreen;


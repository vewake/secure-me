import React, { useContext, useState } from 'react';
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
import { Redirect } from 'expo-router';
import { Picker } from '@react-native-picker/picker'; // Correct import
import ApiConstants from '@/constants/apiConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '@/hooks/authContext';

const RegistrationScreen = () => {
  const { login } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    gender: 'Male',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }
    if (formData.phone.length != 10) {
      setError('Please enter a valid Indian phone number');
      setLoading(false);
      return;
    }


    try {
      formData.gender = formData.gender.toUpperCase();

      const response = await axios.post(ApiConstants.REGISTER_URL, formData);
      const { token } = response.data;
      login(token);
      await AsyncStorage.setItem('token', token);
      setSuccess('Registration successful!');
      setIsRegistered(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed' + err);
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return <Redirect href="/" />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={formData.name}
        onChangeText={(value) => handleInputChange('name', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone (1234567890)"
        value={formData.phone}
        onChangeText={(value) => handleInputChange('phone', value)}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email (abc@gmail.com)"
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(value) => handleInputChange('password', value)}
        secureTextEntry
      />
      <Picker
        selectedValue={formData.gender}
        style={styles.input}
        onValueChange={(value) => handleInputChange('gender', value)}
      >
        <Picker.Item label="Male" value="male" />
        <Picker.Item label="Female" value="female" />
        <Picker.Item label="Other" value="other" />
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={formData.address}
        onChangeText={(value) => handleInputChange('address', value)}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
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
  success: {
    color: 'green',
    marginTop: 10,
  },
});

export default RegistrationScreen;


import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Button, TextInput, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ApiConstants from '@/constants/apiConstants';

export default function Settings() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
      if (!storedToken) {
        router.push('/onboarding');
        return;
      }

      const response = await fetch(ApiConstants.USER_INFO, {
        headers: {
          'Authorization': `${storedToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setUserData(data);
        setEditedData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address || '',
          gender: data.gender,
        });
      } else {
        Alert.alert('Error', 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Something went wrong while fetching your data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Also load saved SOS choices if needed
    async function loadSosChoices() {
      let resp = await AsyncStorage.getItem('sosChoices');
      if (resp !== null) {
        // Process SOS choices if needed
      }
    }
    loadSosChoices();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      router.push('/onbording');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const saveUserData = async () => {
    try {
      setLoading(true);

      // Validate input
      const validationErrors = {};
      if (!editedData.name?.trim()) validationErrors.name = 'Name is required';
      if (!editedData.email?.trim()) validationErrors.email = 'Email is required';
      if (!/^\S+@\S+\.\S+$/.test(editedData.email)) validationErrors.email = 'Invalid email format';
      if (!editedData.phone?.trim()) validationErrors.phone = 'Phone is required';

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // Send update to API
      const response = await fetch(ApiConstants.UPDATE_USER_INFO, {
        method: 'PUT',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserData(updatedData);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Something went wrong while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    try {
      setLoading(true);

      // Validate password data
      const validationErrors = {};
      if (!passwordData.currentPassword) validationErrors.currentPassword = 'Current password is required';
      if (!passwordData.newPassword) validationErrors.newPassword = 'New password is required';
      if (passwordData.newPassword.length < 8) validationErrors.newPassword = 'Password must be at least 8 characters';
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        validationErrors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // Send password change request to API
      const response = await fetch(ApiConstants.CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      });

      if (response.ok) {
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        Alert.alert('Success', 'Password changed successfully');
      } else {
        const errorData = await response.text();
        console.log(errorData);
        Alert.alert('Error', errorData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Something went wrong while changing your password');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Account Settings</Text>

        {!isEditing && !isChangingPassword && (
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{userData?.name?.[0] || '?'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userData?.name}</Text>
                <Text style={styles.profileDetail}>{userData?.email}</Text>
                <Text style={styles.profileDetail}>{userData?.phone}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.settingsOption}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="person-outline" size={24} color="#333" />
              <Text style={styles.optionText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={24} color="#999" style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsOption}
              onPress={() => setIsChangingPassword(true)}
            >
              <Ionicons name="lock-closed-outline" size={24} color="#333" />
              <Text style={styles.optionText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={24} color="#999" style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsOption}
              onPress={() => router.push('/sos-settings')}
            >
              <Ionicons name="alert-circle-outline" size={24} color="#333" />
              <Text style={styles.optionText}>Emergency SOS Settings</Text>
              <Ionicons name="chevron-forward" size={24} color="#999" style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingsOption, styles.logoutOption]}
              onPress={() => {
                Alert.alert(
                  'Confirm Logout',
                  'Are you sure you want to log out?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Logout', onPress: logout, style: 'destructive' }
                  ]
                );
              }}
            >
              <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {isEditing && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={editedData.name}
                onChangeText={(text) => {
                  setEditedData(prev => ({ ...prev, name: text }));
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }}
                placeholder="Your name"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={editedData.email}
                onChangeText={(text) => {
                  setEditedData(prev => ({ ...prev, email: text }));
                  if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                }}
                placeholder="Your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={editedData.phone}
                onChangeText={(text) => {
                  setEditedData(prev => ({ ...prev, phone: text }));
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                }}
                placeholder="Your phone number"
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.input}
                value={editedData.address}
                onChangeText={(text) => setEditedData(prev => ({ ...prev, address: text }))}
                placeholder="Your address"
                multiline
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderOptions}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editedData.gender === 'MALE' && styles.selectedGender
                  ]}
                  onPress={() => setEditedData(prev => ({ ...prev, gender: 'MALE' }))}
                >
                  <Text style={[
                    styles.genderText,
                    editedData.gender === 'MALE' && styles.selectedGenderText
                  ]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editedData.gender === 'FEMALE' && styles.selectedGender
                  ]}
                  onPress={() => setEditedData(prev => ({ ...prev, gender: 'FEMALE' }))}
                >
                  <Text style={[
                    styles.genderText,
                    editedData.gender === 'FEMALE' && styles.selectedGenderText
                  ]}>Female</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editedData.gender === 'OTHER' && styles.selectedGender
                  ]}
                  onPress={() => setEditedData(prev => ({ ...prev, gender: 'OTHER' }))}
                >
                  <Text style={[
                    styles.genderText,
                    editedData.gender === 'OTHER' && styles.selectedGenderText
                  ]}>Other</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={() => {
                  setIsEditing(false);
                  setErrors({});
                  // Reset edited data to original user data
                  if (userData) {
                    setEditedData({
                      name: userData.name,
                      email: userData.email,
                      phone: userData.phone,
                      address: userData.address || '',
                      gender: userData.gender,
                    });
                  }
                }}
              />
              <View style={styles.buttonSpacer} />
              <Button
                title="Save Changes"
                onPress={saveUserData}
                disabled={loading}
              />
            </View>
          </View>
        )}

        {isChangingPassword && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Change Password</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={[styles.input, errors.currentPassword && styles.inputError]}
                value={passwordData.currentPassword}
                onChangeText={(text) => {
                  setPasswordData(prev => ({ ...prev, currentPassword: text }));
                  if (errors.currentPassword) setErrors(prev => ({ ...prev, currentPassword: null }));
                }}
                placeholder="Enter current password"
                secureTextEntry
              />
              {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={[styles.input, errors.newPassword && styles.inputError]}
                value={passwordData.newPassword}
                onChangeText={(text) => {
                  setPasswordData(prev => ({ ...prev, newPassword: text }));
                  if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: null }));
                }}
                placeholder="Enter new password"
                secureTextEntry
              />
              {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                value={passwordData.confirmPassword}
                onChangeText={(text) => {
                  setPasswordData(prev => ({ ...prev, confirmPassword: text }));
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
                }}
                placeholder="Confirm new password"
                secureTextEntry
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={() => {
                  setIsChangingPassword(false);
                  setErrors({});
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
              />
              <View style={styles.buttonSpacer} />
              <Button
                title="Change Password"
                onPress={changePassword}
                disabled={loading}
              />
            </View>
          </View>
        )}

        {loading && <ActivityIndicator size="small" color="#0000ff" style={styles.loadingIndicator} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  logoutOption: {
    marginTop: 10,
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 16,
    marginLeft: 15,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginRight: 8,
    alignItems: 'center',
  },
  selectedGender: {
    borderColor: '#3498db',
    backgroundColor: '#ebf5fd',
  },
  genderText: {
    color: '#666',
  },
  selectedGenderText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonSpacer: {
    width: 10,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

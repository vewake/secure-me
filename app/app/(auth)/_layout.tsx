import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'blue',
        tabBarStyle: {
          backgroundColor: '#f9f9f9',
          borderTopWidth: 0,
          elevation: 5,
          paddingVertical: 10,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
        headerShown: false, // Removed the top header
      }}
    >
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="sign-in" color={color} />,
          tabBarAccessibilityLabel: 'Go to Login',
        }}
      />

      <Tabs.Screen
        name="register"
        options={{
          title: 'Register',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="user-plus" color={color} />,
          tabBarAccessibilityLabel: 'Go to Register',
        }}
      />
    </Tabs>
  );
}


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
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="sign-in" color={color} />,
          tabBarAccessibilityLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="addTrustedUsers"
        options={{
          title: 'Add Users',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="user-plus" color={color} />,
          tabBarAccessibilityLabel: 'Go to Login',
        }}
      />


      <Tabs.Screen
        name="setting"
        options={{
          title: 'Setting',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="gear" color={color} />,
          tabBarAccessibilityLabel: 'Setting',
        }}
      />


    </Tabs>
  );
}


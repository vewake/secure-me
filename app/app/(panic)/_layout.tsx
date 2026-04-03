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
        name="panicHome"
        options={{
          title: 'panicHome',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="camera" color={color} />,
          tabBarAccessibilityLabel: 'Setting',
        }}
      />
      <Tabs.Screen
        name="nearbyuser"
        options={{
          title: 'nearby user',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="users" color={color} />,
          tabBarAccessibilityLabel: 'Go to Login',
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Logs',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="table" color={color} />,
          tabBarAccessibilityLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="helpful"
        options={{
          title: 'other',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="bars" color={color} />,
          tabBarAccessibilityLabel: 'Go to Login',
        }} />

      {/* <Tabs.Screen */}
      {/*   name="notificationAndLocationStuff" */}
      {/*   options={{ */}
      {/*     title: 'notification', */}
      {/*     tabBarIcon: ({ color }) => <FontAwesome size={24} name="gear" color={color} />, */}
      {/*     tabBarAccessibilityLabel: 'Setting', */}
      {/*   }} */}
      {/* /> */}
    </Tabs>
  );
}


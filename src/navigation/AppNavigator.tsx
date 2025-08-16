import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { ConsentScreen } from '../screens/ConsentScreen/ConsentScreen';
import { ConsentCallbackScreen } from '../screens/ConsentCallbackScreen/ConsentCallbackScreen';
import { AccountsScreen } from '../screens/AccountsScreen/AccountsScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen/TransactionsScreen';
import { WebViewScreen } from '../screens/WebViewScreen/WebViewScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Consent') {
            iconName = focused ? 'shield-checkmark' : 'shield-outline';
          } else if (route.name === 'Accounts') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'list' : 'list-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Consent" component={ConsentScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
    </Tab.Navigator>
  );
};

import { navigationRef } from './navigationRef';

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="WebView" component={WebViewScreen} />
        <Stack.Screen name="ConsentCallback" component={ConsentCallbackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 
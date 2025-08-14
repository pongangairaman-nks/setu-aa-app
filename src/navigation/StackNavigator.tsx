import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { TabNavigator } from './TabNavigator';
import { WebViewScreen } from '../screens/WebViewScreen/WebViewScreen';
import { ConsentCallbackScreen } from '../screens/ConsentCallbackScreen/ConsentCallbackScreen';

const Stack = createStackNavigator();

export const StackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="WebView" component={WebViewScreen} />
      <Stack.Screen name="ConsentCallback" component={ConsentCallbackScreen} />
    </Stack.Navigator>
  );
}; 
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import RaceRouletteScreen from './src/screens/RaceRouletteScreen';
import TeamBuilderScreen from './src/screens/TeamBuilderScreen';
import AssignTeamsScreen from './src/screens/AssignTeamsScreen';
import ScoreboardScreen from './src/screens/ScoreboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Velox 1' }}
        />
        <Stack.Screen 
          name="RaceRoulette" 
          component={RaceRouletteScreen} 
          options={{ title: 'Race Roulette' }}
        />
        <Stack.Screen 
          name="TeamBuilder" 
          component={TeamBuilderScreen} 
          options={{ title: 'Team Builder' }}
        />
        <Stack.Screen 
          name="AssignTeams" 
          component={AssignTeamsScreen} 
          options={{ title: 'Assign Teams' }}
        />
        <Stack.Screen 
          name="Scoreboard" 
          component={ScoreboardScreen} 
          options={{ title: 'Scoreboard' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 
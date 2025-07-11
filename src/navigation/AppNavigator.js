// src/navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import MainTabNavigator from './MainTabNavigator';
import EditarPerfilScreen from '../screens/EditarPerfilScreen';
import RecuperarSenhaScreen from '../screens/RecuperarSenhaScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} />
      <Stack.Screen name="RecuperarSenha" component={RecuperarSenhaScreen}/>
      <Stack.Screen name="Home" component={MainTabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

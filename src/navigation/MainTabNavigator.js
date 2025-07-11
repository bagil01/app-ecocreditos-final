// src/navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PerfilScreen from '../screens/PerfilScreen';
import BancoResiduosScreen from '../screens/BancoResiduos';
import HistoricoScreen from '../screens/HistoricoScreen';


const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Banco de residuos" component={BancoResiduosScreen} />
      <Tab.Screen name="Hitorico" component={HistoricoScreen}/>
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

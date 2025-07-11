import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, Alert,
  TouchableOpacity
} from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';

export default function PerfilScreen() {
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, 'usuarios', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUserData(snap.data());
        } else {
          Alert.alert("Erro", "Usuário não encontrado.");
        }
      }
    });

    return unsubscribe;
  }, []);

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.avatar} />
        <Text style={styles.name}>{userData.nome}</Text>
        <Text style={styles.tipo}>
          {userData.tipo === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
        </Text>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditarPerfil")}>
          <Text style={styles.editButtonText}>Editar perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Dados */}
      <View style={styles.card}>
        {userData.tipo === 'PJ' ? (
          <>
            <Text style={styles.info}><Text style={styles.label}>CNPJ:</Text> {userData.cnpj}</Text>
            <Text style={styles.info}><Text style={styles.label}>Responsável:</Text> {userData.nomeResponsavel}</Text>
          </>
        ) : (
          <Text style={styles.info}><Text style={styles.label}>CPF:</Text> {userData.cpf}</Text>
        )}
        <Text style={styles.info}><Text style={styles.label}>Telefone:</Text> {userData.telefone}</Text>
        <Text style={styles.info}><Text style={styles.label}>Email:</Text> {userData.email}</Text>
        <Text style={styles.info}><Text style={styles.label}>Créditos:</Text> EC$ {userData.creditos}</Text>
      </View>

      {/* Preferências */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        <View style={styles.optionRow}>
          <Text>Notificações</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
        <View style={styles.optionRow}>
          <Text>Tema escuro</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </View>

      {/* Sobre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        <TouchableOpacity style={styles.linkRow}>
          <Text>Ajuda e suporte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow}>
          <Text>Termos e condições</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f6f4',
    padding: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#2e7d32',
    paddingVertical: 20,
    borderRadius: 10,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#fff', marginBottom: 10,
  },
  name: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  tipo: {
    color: '#e0f2f1',
  },
  editButton: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
  },
  info: {
    fontSize: 14,
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  linkRow: {
    paddingVertical: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
});

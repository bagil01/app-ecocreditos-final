import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert
} from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';

export default function EditarPerfilScreen() {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, 'usuarios', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const dados = snap.data();
          setUserData({ ...dados, uid: user.uid });
          setFormData(dados);
        }
      }
    });

    return unsubscribe;
  }, []);

  const handleChange = (campo, valor) => {
    setFormData({ ...formData, [campo]: valor });
  };

  const handleSalvar = async () => {
    try {
      const ref = doc(db, 'usuarios', userData.uid);
      await updateDoc(ref, formData);
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados.');
    }
  };

  if (!userData) {
    return <Text style={{ padding: 20 }}>Carregando...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={formData.nome}
        onChangeText={(text) => handleChange('nome', text)}
      />

      {userData.tipo === 'PF' ? (
        <TextInput
          style={styles.input}
          placeholder="CPF"
          value={formData.cpf}
          onChangeText={(text) => handleChange('cpf', text)}
        />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="CNPJ"
            value={formData.cnpj}
            onChangeText={(text) => handleChange('cnpj', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Nome do Responsável"
            value={formData.nomeResponsavel}
            onChangeText={(text) => handleChange('nomeResponsavel', text)}
          />
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={formData.telefone}
        onChangeText={(text) => handleChange('telefone', text)}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleSalvar}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e6f5ec',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';

export default function RecuperarSenhaScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const handleRecuperarSenha = async () => {
    if (!email) {
      Alert.alert('Atenção', 'Digite seu e-mail.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Verifique seu e-mail', 'Enviamos um link para redefinir sua senha.');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      Alert.alert('Erro', 'Não foi possível enviar o e-mail de recuperação.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleRecuperarSenha}>
        <Text style={styles.buttonText}>Enviar link de redefinição</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.voltarText}>Voltar para login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#e6f5ec',
    padding: 20, justifyContent: 'center'
  },
  title: {
    fontSize: 22, fontWeight: 'bold',
    color: '#2e7d32', textAlign: 'center', marginBottom: 20
  },
  input: {
    backgroundColor: '#fff', padding: 12,
    borderRadius: 5, marginBottom: 15
  },
  button: {
    backgroundColor: '#2e7d32', padding: 14,
    borderRadius: 8, alignItems: 'center'
  },
  buttonText: {
    color: '#fff', fontSize: 16
  },
  voltarText: {
    marginTop: 20, textAlign: 'center',
    color: '#2e7d32', textDecorationLine: 'underline'
  }
});

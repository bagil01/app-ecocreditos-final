import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha e-mail e senha.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigation.replace("Home");
    } catch (error) {
      console.error("Erro no login:", error);
      Alert.alert("Erro", "E-mail ou senha inválidos.");
    }
  };

  const handleEsqueciSenha = async () => {
    if (!email) {
      Alert.alert("Atenção", "Digite seu e-mail para recuperar a senha.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Verifique seu e-mail", "Um link de redefinição de senha foi enviado.");
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
      Alert.alert("Erro", "Não foi possível enviar o e-mail de redefinição.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("RecuperarSenha")} style={styles.linkButton}>
        <Text style={styles.linkText}>Esqueci minha senha</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#e6f5ec'
  },
  title: {
    fontSize: 24, fontWeight: 'bold', color: '#2e7d32',
    marginBottom: 20, textAlign: 'center'
  },
  input: {
    backgroundColor: '#fff', padding: 12,
    borderRadius: 5, marginBottom: 12
  },
  button: {
    backgroundColor: '#2e7d32', padding: 14,
    borderRadius: 8, alignItems: 'center', marginTop: 10
  },
  buttonText: {
    color: '#fff', fontSize: 16
  },
  linkButton: {
    marginTop: 15, alignItems: 'center'
  },
  linkText: {
    color: '#2e7d32', fontWeight: 'bold', textDecorationLine: 'underline'
  }
});

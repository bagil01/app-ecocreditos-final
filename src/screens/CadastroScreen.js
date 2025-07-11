import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function CadastroScreen() {
  const navigation = useNavigation();
  const [tipoConta, setTipoConta] = useState('PF');
  const [formData, setFormData] = useState({
    nome: '',
    nomeResponsavel: '',
    email: '',
    senha: '',
    cpf: '',
    cnpj: '',
    telefone: '',
  });

  const handleChange = (campo, valor) => {
    setFormData({ ...formData, [campo]: valor });
  };

  const handleCadastro = async () => {
    const { email, senha } = formData;

    if (!email || !senha || !formData.nome || !formData.telefone) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Prepara os dados para o Firestore
      const dadosUsuario =
        tipoConta === 'PF'
          ? {
            tipo: 'PF',
            nome: formData.nome,
            cpf: formData.cpf,
            telefone: formData.telefone,
            email: formData.email,
            creditos: 0,
            createdAt: new Date(),
          }
          : {
            tipo: 'PJ',
            nome: formData.nome,
            nomeResponsavel: formData.nomeResponsavel,
            cnpj: formData.cnpj,
            telefone: formData.telefone,
            email: formData.email,
            creditos: 0,
            createdAt: new Date(),
          };

      // Salva no Firestore com UID do Auth
      await setDoc(doc(db, 'usuarios', user.uid), dadosUsuario);

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      navigation.replace('Login');
    } catch (error) {
      console.error("Erro no cadastro:", error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert("Erro", "Este e-mail já está em uso. Tente outro.");
      } else {
        Alert.alert("Erro no cadastro", error.message);
      }
    }

  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[styles.switchButton, tipoConta === 'PF' && styles.activeButton]}
          onPress={() => setTipoConta('PF')}
        >
          <Text style={tipoConta === 'PF' ? styles.activeText : styles.inactiveText}>
            Pessoa Física
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchButton, tipoConta === 'PJ' && styles.activeButton]}
          onPress={() => setTipoConta('PJ')}
        >
          <Text style={tipoConta === 'PJ' ? styles.activeText : styles.inactiveText}>
            Pessoa Jurídica
          </Text>
        </TouchableOpacity>
      </View>

      {/* Campos específicos */}
      {tipoConta === 'PF' ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={formData.nome}
            onChangeText={(text) => handleChange('nome', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="CPF"
            value={formData.cpf}
            onChangeText={(text) => handleChange('cpf', text)}
            keyboardType="numeric"
          />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nome da empresa"
            value={formData.nome}
            onChangeText={(text) => handleChange('nome', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Nome do responsável"
            value={formData.nomeResponsavel}
            onChangeText={(text) => handleChange('nomeResponsavel', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="CNPJ"
            value={formData.cnpj}
            onChangeText={(text) => handleChange('cnpj', text)}
            keyboardType="numeric"
          />
        </>
      )}

      {/* Campos comuns */}
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={formData.senha}
        onChangeText={(text) => handleChange('senha', text)}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={formData.telefone}
        onChangeText={(text) => handleChange('telefone', text)}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Cadastrar</Text>
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
    fontSize: 24,
    color: '#2e7d32',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  switchButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#D2EBDC',
  },
  activeButton: {
    backgroundColor: '#2e7d32',
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#000',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 5,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
  },
});

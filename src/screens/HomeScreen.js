import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { auth, db } from '../services/firebase';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function HomeScreen() {
  const [userData, setUserData] = useState(null);
  const [transacoes, setTransacoes] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, 'usuarios', user.uid);

    // Escuta em tempo real o documento do usuário (para atualizar créditos automaticamente)
    const unsubscribeUser = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const userInfo = snap.data();
        setUserData({ ...userInfo, id: user.uid });
      }
    });

    // Escuta em tempo real as transações
    const q = query(
      collection(db, 'transacoes'),
      where('participantes', 'array-contains', user.uid),
      orderBy('criadoEm', 'desc')
    );

    const unsubscribeTransacoes = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => {
        const data = doc.data();
        const dataFormatada = data.criadoEm?.toDate().toLocaleDateString('pt-BR') || '';
        const valor =
          data.coletorId === user.uid ? `+${data.creditosPF} EC` : `+${data.creditosPJ} EC`;

        return {
          id: doc.id,
          titulo: data.titulo,
          valor,
          data: dataFormatada,
        };
      });

      setTransacoes(lista.slice(0, 5)); // exibe as 5 mais recentes
    });

    return () => {
      unsubscribeUser();
      unsubscribeTransacoes();
    };
  }, []);

  if (!userData) return <Text style={styles.loading}>Carregando...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Olá, {userData.nome}</Text>
      <Text style={styles.subtitulo}>Bem-vindo ao EcoCréditos</Text>

      <View style={styles.saldoBox}>
        <Text style={styles.saldoLabel}>Seu saldo de EcoCréditos</Text>
        <Text style={styles.saldo}>EC$ {userData.creditos?.toFixed(2) || '0.00'}</Text>
      </View>

      <Text style={styles.secao}>Atividades recentes</Text>
      {transacoes.length === 0 ? (
        <Text style={styles.semDados}>Nenhuma transação ainda</Text>
      ) : (
        <FlatList
          data={transacoes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.transacao}>
              <Text style={styles.transacaoTitulo}>{item.titulo}</Text>
              <Text style={styles.transacaoValor}>{item.valor}</Text>
              <Text style={styles.transacaoData}>{item.data}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F4F7F9',
    flex: 1,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitulo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  saldoBox: {
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  saldoLabel: {
    color: '#DDEDDD',
    fontSize: 14,
  },
  saldo: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  secao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  semDados: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  transacao: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transacaoTitulo: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  transacaoValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  transacaoData: {
    fontSize: 12,
    color: '#999',
  },
  loading: {
    padding: 20,
    textAlign: 'center',
    color: '#555',
  },
});

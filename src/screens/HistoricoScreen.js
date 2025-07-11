import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export default function HistoricoScreen() {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;

      const q = query(
        collection(db, 'transacoes'),
        where('participantes', 'array-contains', user.uid),
        orderBy('criadoEm', 'desc')
      );

      const unsubscribeTransacoes = onSnapshot(q, (snapshot) => {
        const dados = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            dataFormatada: data.criadoEm?.toDate().toLocaleString('pt-BR') || 'Sem data'
          };
        });

        setTransacoes(dados);
        setLoading(false);
      });

      // limpeza
      return () => unsubscribeTransacoes();
    });

    return () => unsubscribeAuth();
  }, []);


  if (loading) return <Text style={styles.loading}>Carregando...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Histórico de Transações</Text>

      {transacoes.length === 0 ? (
        <Text style={styles.vazio}>Nenhuma transação registrada ainda.</Text>
      ) : (
        <FlatList
          data={transacoes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.tituloTransacao}>{item.titulo}</Text>
              <Text>Tipo: {item.tipo}</Text>
              <Text>Quantidade: {item.quantidade} {item.unidade}</Text>
              <Text>Local: {item.localizacao}</Text>
              <Text>Créditos gerados: PF +{item.creditosPF} | PJ +{item.creditosPJ}</Text>
              <Text style={styles.data}>{item.dataFormatada}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e6f5ec',
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 20,
  },
  loading: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#555',
  },
  vazio: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tituloTransacao: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  data: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
  }
});

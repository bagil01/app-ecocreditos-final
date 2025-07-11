import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../services/firebase';



export default function BancoResiduosScreen() {
  const [userData, setUserData] = useState(null);
  const [residuos, setResiduos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    titulo: '',
    tipo: '',
    quantidade: '',
    localizacao: ''
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const usuarioRef = doc(db, 'usuarios', user.uid);
          const usuarioDoc = await getDoc(usuarioRef);
          if (usuarioDoc.exists()) {
            const data = usuarioDoc.data();
            setUserData({ ...data, id: user.uid });
            fetchResiduos(user.uid, data.tipo);
          } else {
            Alert.alert("Erro", "Usuário não encontrado.");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        Alert.alert("Erro", "Falha ao obter os dados do usuário.");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchResiduos = async (uid, tipo) => {
    try {
      let residuosQuery = collection(db, 'residuos');
      if (tipo === 'PJ') {
        residuosQuery = query(residuosQuery, where('userId', '==', uid));
      }
      const snapshot = await getDocs(residuosQuery);
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResiduos(lista);
    } catch (error) {
      console.error("Erro ao buscar resíduos:", error);
      Alert.alert("Erro", "Não foi possível carregar os resíduos.");
    }
  };

  const handleColetar = (residuo) => {
    Alert.alert(
      'Confirmar coleta',
      `Deseja confirmar a coleta de "${residuo.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const quantidade = parseFloat(residuo.quantidade);
              if (isNaN(quantidade) || quantidade < 10) {
                Alert.alert("Erro", "A quantidade mínima para gerar créditos é de 10 kg.");
                return;
              }

              const creditosPF = Math.floor(quantidade / 10) * 3;
              const creditosPJ = Math.floor(quantidade / 10);

              const userRef = doc(db, 'usuarios', userData.id);
              const pjRef = doc(db, 'usuarios', residuo.userId);

              // Atualiza créditos do usuário PF
              const pfSnap = await getDoc(userRef);
              const pfAtual = pfSnap.data().creditos || 0;
              await updateDoc(userRef, { creditos: pfAtual + creditosPF });

              // Atualiza créditos do usuário PJ
              const pjSnap = await getDoc(pjRef);
              const pjAtual = pjSnap.data().creditos || 0;
              await updateDoc(pjRef, { creditos: pjAtual + creditosPJ });

              // Registra a transação
              await addDoc(collection(db, 'transacoes'), {
                coletorId: userData.id,
                geradorId: residuo.userId,
                participantes: [userData.id, residuo.userId], // ← ESSENCIAL
                titulo: residuo.titulo,
                tipo: residuo.tipo,
                quantidade: quantidade,
                unidade: residuo.unidade,
                localizacao: residuo.localizacao,
                creditosPF: creditosPF,
                creditosPJ: creditosPJ,
                criadoEm: new Date()
              });


              // Remove o resíduo do banco
              await deleteDoc(doc(db, 'residuos', residuo.id));

              Alert.alert("Sucesso", `Coleta registrada!\n+${creditosPF} créditos para você\n+${creditosPJ} para a empresa`);

              // Atualiza lista de resíduos
              fetchResiduos();
            } catch (error) {
              console.error("Erro ao finalizar coleta:", error);
              Alert.alert("Erro", "Não foi possível concluir a coleta.");
            }
          },
        },
      ]
    );
  };


  const handleCadastrarResíduo = async () => {
    const { titulo, tipo, quantidade, localizacao } = form;
    const quantidadeNum = parseFloat(quantidade);

    if (!titulo || !tipo || !quantidade || !localizacao) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    if (quantidadeNum < 10) {
      Alert.alert("Erro", "A quantidade mínima é de 10 kg.");
      return;
    }

    try {
      if (editando) {
        const docRef = doc(db, 'residuos', editando.id);
        await updateDoc(docRef, { titulo, tipo, quantidade, unidade: 'kg', localizacao });
        Alert.alert("Sucesso", "Resíduo atualizado!");
      } else {
        await addDoc(collection(db, 'residuos'), {
          titulo,
          tipo,
          quantidade,
          unidade: 'kg',
          localizacao,
          userId: userData.id,
          criadoEm: new Date()
        });
        Alert.alert("Sucesso", "Resíduo cadastrado!");
      }

      setForm({ titulo: '', tipo: '', quantidade: '', localizacao: '' });
      setModalVisible(false);
      setEditando(null);
      fetchResiduos(userData.id, userData.tipo);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao salvar o resíduo.");
    }
  };

  const handleExcluir = async (id) => {
    try {
      await deleteDoc(doc(db, 'residuos', id));
      Alert.alert("Excluído", "Resíduo removido.");
      fetchResiduos(userData.id, userData.tipo);
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleEditar = (residuo) => {
    setForm({
      titulo: residuo.titulo,
      tipo: residuo.tipo,
      quantidade: residuo.quantidade,
      localizacao: residuo.localizacao
    });
    setEditando(residuo);
    setModalVisible(true);
  };

  if (!userData) return <Text style={styles.loading}>Carregando...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Banco de Resíduos</Text>

      {userData.tipo === 'PJ' && (
        <TouchableOpacity style={styles.button} onPress={() => { setEditando(null); setForm({ titulo: '', tipo: '', quantidade: '', localizacao: '' }); setModalVisible(true); }}>
          <Text style={styles.buttonText}>Cadastrar Resíduo</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={residuos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text>Tipo: {item.tipo}</Text>
            <Text>Quantidade: {item.quantidade} {item.unidade}</Text>
            <Text>Localização: {item.localizacao}</Text>
            {userData.tipo === 'PF' ? (
              <TouchableOpacity style={styles.button} onPress={() => handleColetar(item)}>
                <Text style={styles.buttonText}>Coletar</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pjActions}>
                <TouchableOpacity style={styles.button} onPress={() => handleEditar(item)}>
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: '#d32f2f' }]} onPress={() => handleExcluir(item.id)}>
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{editando ? 'Editar' : 'Cadastrar'} Resíduo</Text>
          <TextInput style={styles.input} placeholder="Título" value={form.titulo} onChangeText={t => setForm({ ...form, titulo: t })} />
          <TextInput style={styles.input} placeholder="Tipo" value={form.tipo} onChangeText={t => setForm({ ...form, tipo: t })} />
          <TextInput style={styles.input} placeholder="Quantidade (mínimo 10kg)" keyboardType="numeric" value={form.quantidade} onChangeText={t => setForm({ ...form, quantidade: t })} />
          <TextInput style={[styles.input, { backgroundColor: '#ccc' }]} editable={false} value="kg" />
          <TextInput style={styles.input} placeholder="Localização" value={form.localizacao} onChangeText={t => setForm({ ...form, localizacao: t })} />
          <TouchableOpacity style={styles.button} onPress={handleCadastrarResíduo}>
            <Text style={styles.buttonText}>{editando ? 'Atualizar' : 'Cadastrar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#999' }]} onPress={() => setModalVisible(false)}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#e6f5ec', flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#2e7d32' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 5, marginBottom: 10 },
  button: { backgroundColor: '#2e7d32', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  pjActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 10 },
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#e6f5ec' },
  loading: { flex: 1, textAlign: 'center', marginTop: 50, color: '#999' }
});

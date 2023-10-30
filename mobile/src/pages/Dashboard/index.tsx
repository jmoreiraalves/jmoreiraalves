import React, { useContext, useEffect, useState }  from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, TextInput, StyleSheet} from 'react-native'

import { useNavigation } from '@react-navigation/native'

import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StackPramsList } from '../../routes/app.routes'

import { AuthContext } from '../../contexts/AuthContext'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProps } from "../../pages/SemLancamento";

//import { api } from '../../services/api'

export default function Dashboard(){
  const navigation = useNavigation<NativeStackNavigationProp<StackPramsList>>();

  //const [number, setNumber] = useState('');

  const { signOut, loadingAuth} = useContext(AuthContext)
  const [usuario, setUsuario] = useState('');


  async function handlesignOut(){
    await signOut()
  }

  // async function openOrder(){
  //   // if(number === ''){
  //   //   return;
  //   // }

  //   // const response = await api.post('/order', {
  //   //   table: Number(number)
  //   // })

  //   //console.log(response.data);

  //   //navigation.navigate('Order', { number: number, order_id: response.data.id })

  //   //setNumber('');

  //   navigation.navigate('RelMetaAbaixo')

  // }

  async function openMetaAbaixo(){
    navigation.navigate('RelMetaAbaixo')
  }

  async function openSemLancamento(){
    navigation.navigate('SemLancamento')
  }

 async function openGrafics() {
  navigation.navigate('ResumoFunil')
 }

  const loadusuario =async () => {
    const userInfo = await AsyncStorage.getItem("@sujeitopizzaria");
    let hasUser: UserProps = JSON.parse(userInfo || "{}");
    setUsuario(hasUser.name);
  }

  useEffect(()=>{
    loadusuario();
  }, [] );


  return(
    <SafeAreaView style={styles.container}>
        <Image
        style={styles.logo}
        source={require('../../assets/Logo6d_menu.png')}
        />
        <Text style={styles.usuariologado}>Usuario: {usuario}</Text>
        {/* <Text style={styles.title}>Relatórios</Text> */}

        {/* <TextInput
          placeholder="Numero da mesa"
          placeholderTextColor="#F0F0F0"
          style={styles.input}
          keyboardType="numeric"
          value={number}
          onChangeText={setNumber}
        /> */}

        <TouchableOpacity style={styles.button} onPress={openMetaAbaixo}>
          <Text style={styles.buttonText}>Meta Abaixo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={openSemLancamento}>
          <Text style={styles.buttonText}>Sem Lancamentos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={openGrafics}>
          <Text style={styles.buttonText}>Gráficos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlesignOut}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#65bafc'
  },
  title:{
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 24,
  },
  usuariologado:{
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 24,
  },
  input:{
    width: '90%',
    height: 60,
    backgroundColor: '#101026',
    borderRadius: 4,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 22,
    color: '#FFF'
  },
  button:{
    width: '90%',
    height: 40,
    backgroundColor: '#007ddd',
    borderRadius: 4,
    marginVertical: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText:{
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold'
  },
  logo:{
    marginBottom: 18,
    width: 50,
    height: 50
  }
})
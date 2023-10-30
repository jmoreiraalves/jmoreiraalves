import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  FlatList,
} from "react-native";

import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";

import { Feather } from "@expo/vector-icons";
import { api } from "../../services/api";
import { ModalPicker } from "../../components/ModalPicker";
import { ListItem } from "../../components/ListItem";
import { UserProps } from "../../pages/SemLancamento";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackPramsList } from "../../routes/app.routes";
import { MaskedTextInput} from "react-native-mask-text";

import SnackBar from 'react-native-snackbar-component'

type RouteDetailParams = {
  ResumoFunil: {
    headoffice_id: number | string;
    unit_id: number | string;
    canal_id: number | string;
    start_date: string;
    end_date: string;
  };
};

export type FilterProps = {
  id: string;
  name: string;
};

type FunilRouteProps = RouteProp<RouteDetailParams, "ResumoFunil">;

export default function ResumoFunil() {
  const route = useRoute<FunilRouteProps>();
  const navigation = useNavigation<NativeStackNavigationProp<StackPramsList>>();

  const [userid, setUserid] = useState<number>();

  const [channel, setChannel] = useState<FilterProps[] | []>([]);
  const [channelSelected, setChannelSelected] = useState<FilterProps | undefined >();
  const [modalChannelVisible, setModalChannelVisible] = useState(false);

  const [headoffices, setHeadoffices] = useState<FilterProps[] | []>([]);
  const [headofficeSelected, setHeadofficeSelected] = useState<FilterProps | undefined>();
  const [modalHeadofficeVisible, setModalHeadofficeVisible] = useState(false);

  const [units, setUnits] = useState<FilterProps[] | []>([]);
  const [unitSelected, setUnitSelected] = useState<FilterProps | undefined>();
  const [modalUnitVisible, setModalUnitVisible] = useState(false);

  const [startdate, setStartDate] = useState("");
  const [unStartDate, setUnStartDate] = useState("");

  const [endDate, setEndDate] = useState("");
  const [unEndDate, setUnEndDate] = useState("");

  const [snackbarVisible, setSnackbarVisible] =useState(false);
  const [snackbarMsg, setSnackbarMsg]= useState("");

  useEffect(() => {
    async function loadInfo() {
      const userInfo = await AsyncStorage.getItem("@sujeitopizzaria");
      let hasUser: UserProps = JSON.parse(userInfo || "{}");
      
      const response = await api.get("/api/sales-funnel/listchannel");
      
      setChannel(response.data);
      setChannelSelected(response.data[0]);
      
      setTimeout(() => {
               setTimeout(() => {
                 loadInfoHeader(parseInt(hasUser.id));        
               }, 5000);     
      }, 1000);        
    }

    async function loadInfoHeader(userid: number) {
      // //  recupear as matrizes do usuario
      setUserid(userid);      
      const responseheadoffice = await api.get("/api/head-offices/filter/mobile", {
        params: {
          ids001: userid.toString(),
        },
      });
      setHeadoffices(responseheadoffice.data);
      setHeadofficeSelected(responseheadoffice.data[0]);      
    }
    loadInfo();  
  }, []);

      async function loadUnits(idg001:number, ids001:number){

      console.log('Matriz selecionada ', idg001);
      console.log("Usuario ativo " , ids001);

      const responseunit = await api.get('/api/units/filter/mobile/bymatriz', {
        params:{
          idg001: idg001,
          ids001: ids001
        }
      
      });



      console.log("retorno api unidade" ,  responseunit.data);

      setUnits(responseunit.data);
      setUnitSelected(responseunit.data[0]);
      console.log("Unidades" ,  units);
      console.log("Unidade selecionada ", unitSelected);

    }
  

  function handleChangeChannel(item: FilterProps){
    setChannelSelected(item);
  }

  function handleChangeHeadoffice(item: FilterProps){
    setHeadofficeSelected(item);
    // console.log("Filtro Matriz");
    // console.log(headofficeSelected?.id);
    // console.log(userid);
    //buscar as unidades desta matriz
    loadUnits(parseInt(headofficeSelected?.id), userid);

  }

  function handleChangeUnits(item: FilterProps){
    setUnitSelected(item);
  }

  function handlebackhome() {
    //retorna ao dashboard
    navigation.navigate("Dashboard");
  }

  function handleExecuteFilter(){
    
    console.log('Executar filtro');
    console.log("Data Inicial" , startdate);
    console.log("Data Final" , endDate);
    console.log("Canal ", channelSelected);
    console.log("Matriz ", headofficeSelected);
    console.log("Unidade ", unitSelected);
    console.log("Usuario" , userid);

    if(
          startdate.length === undefined
       || endDate.length === undefined
       || channelSelected?.id === undefined
       || headofficeSelected?.id === undefined       
       || userid === undefined  
    ){
    setSnackbarVisible(true);
    setSnackbarMsg("Preencha todos os filtros!");
    setTimeout(() => {
      setSnackbarVisible(false);
    }, 3000);
  }
  else{
    //mudar para tela que carrega as informações dos graficos
     navigation.navigate('getGrafics', { 
      headofficeid:  headofficeSelected?.id,
      unitid: unitSelected?.id,
      canalid: channelSelected.id,
      startdate: startdate,
      enddate: endDate
      })
  }
}

  return (
    <View style={styles.container}>
      <SnackBar visible={snackbarVisible} textMessage={snackbarMsg} 
      messageColor="#FFF"
      backgroundColor="red"
      />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.buttonAdd} onPress={handlebackhome}>
          <Image
            style={styles.refreshpg}
            source={require("../../assets/back_arrow_icon.png")}
          />
        </TouchableOpacity>

        <Image
          style={styles.logo}
          source={require("../../assets/Logo6d_menu.png")}
        />

        {/* <TouchableOpacity style={styles.buttonRefreshpg} onPress={handlerefreshpg}>
          <Image
            style={styles.refreshpg}
            source={require("../../assets/refresh_black.png")}
          />
        </TouchableOpacity> */}
      </View>
      
      <Text style={styles.txlabel}>Data Inicial</Text>
      <MaskedTextInput
        mask="99/99/9999"
        onChangeText={(text, rawText) => {
          setStartDate(text);
          setUnStartDate(rawText);
        }}
        style={styles.input}
        keyboardType="numeric"
      />

      <Text style={styles.txlabel}>Data Final</Text>
      <MaskedTextInput
        mask="99/99/9999"
        onChangeText={(text, rawText) => {
          setEndDate(text);
          setUnEndDate(rawText);
        }}
        style={styles.input}
        keyboardType="numeric"
      />

      <Text style={styles.txlabel}>Canal</Text>
      {channel.length !==0 && (        
        <TouchableOpacity style={styles.input} onPress={()=>setModalChannelVisible(true)}>
          <Text style={{color: '#FFF'}} >
              {channelSelected?.name}
          </Text>
        </TouchableOpacity>
      )}
      <Text style={styles.txlabel}>Matriz</Text>
      {headoffices.length !==0 &&(
        <TouchableOpacity style={styles.input} onPress={()=>setModalHeadofficeVisible(true)}>
          <Text style={{color: '#FFF'}} >
              {headofficeSelected?.name}
          </Text>
        </TouchableOpacity>
      )}
      <Text style={styles.txlabel}>Unidade</Text>
      {units.length !==0 && (
        <TouchableOpacity style={styles.input} onPress={()=>setModalUnitVisible(true)}>
          <Text style={{color: '#FFF'}} >
              {unitSelected?.name}
          </Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.button} onPress={handleExecuteFilter}>
        <Text style={styles.buttonText}>Filtrar</Text>
      </TouchableOpacity>


      <Modal
        transparent={true}
        visible={modalChannelVisible}
        animationType="fade"
      >

        <ModalPicker
          handleCloseModal={ () => setModalChannelVisible(false) }
          options={channel}
          selectedItem={ handleChangeChannel }
        />

      </Modal>

      <Modal
        transparent={true}
        visible={modalHeadofficeVisible}
        animationType="fade"
      >

        <ModalPicker
          handleCloseModal={ () => setModalHeadofficeVisible(false) }
          options={headoffices}
          selectedItem={ handleChangeHeadoffice }
        />        

      </Modal>

     {/* Modal de escolha das unidades */}
     <Modal
        transparent={true}
        visible={modalUnitVisible}
        animationType="fade"
      >

        <ModalPicker
          handleCloseModal={ () => setModalUnitVisible(false) }
          options={units}
          selectedItem={ handleChangeUnits }
        />        

      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1d1d2e",
    paddingVertical: "5%",
    paddingEnd: "4%",
    paddingStart: "4%",
  },
  header: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
    marginTop: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFF",
    marginRight: 14,
  },
  txlabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginRight: 14,
  },
  input: {
    backgroundColor: "#101026",
    borderRadius: 4,
    width: "100%",
    height: 40,
    marginBottom: 12,
    justifyContent: "center",
    paddingHorizontal: 8,
    color: "#FFF",
    fontSize: 20,
  },
  qtdContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qtdText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  actions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  buttonAdd: {
    width: "20%",
    backgroundColor: "#3fd1ff",
    borderRadius: 4,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#101026",
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#3fffa3",
    borderRadius: 4,
    height: 40,
    width: "75%",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    marginBottom: 18,
    width: 50,
    height: 50,
  },
  refreshpg: {
    marginBottom: 10,
    width: 20,
    height: 20,
  },
  buttonRefreshpg: {
    width: "20%",
    backgroundColor: "#007ddd",
    borderRadius: 4,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  option: {
    alignItems: "flex-start",
    borderTopWidth: 0.8,
  },
  item: {
    margin: 18,
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },
});

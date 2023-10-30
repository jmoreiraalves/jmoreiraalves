import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../services/api";
import { useNavigation } from '@react-navigation/native'

import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StackPramsList } from '../../routes/app.routes'


export type CompanyProps = {
  id: string;
  name: string;
  type: string;
};

export type UserProps = {
  id: string;
  name: string;
  email: string;
  token: string;
};

export default function ResumoFunilDetalhe() {
  const [company, setCompany] = useState<CompanyProps[] | []>([]);
  const navigation = useNavigation<NativeStackNavigationProp<StackPramsList>>();

  useEffect(() => {
    async function loadInfo() {
      handlerefreshpg();     
    }

    loadInfo();
  }, []);

  function onPressItem(item: CompanyProps) {
    console.log(item);
    //selectedItem(item);
    //handleCloseModal();
  }

  const option = company.map((item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.option}
      onPress={() => onPressItem(item)}
    >
      <Text style={styles.item}>{item?.name}</Text>
    </TouchableOpacity>
  ));

  async function handlerefreshpg() {
    const userInfo = await AsyncStorage.getItem("@sujeitopizzaria");
    let hasUser: UserProps = JSON.parse(userInfo || "{}");
    const response = await api.get("/api/sales-funnel/norelease", {
      params: {
        user_id: hasUser.id,
      },
    });

    setCompany(response.data);
  }

  function handlebackhome() {
    //retorna ao dashboard
    navigation.navigate('Dashboard')
  }

  return (
    <SafeAreaView style={styles.container}>
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

        <TouchableOpacity style={styles.buttonRefreshpg} onPress={handlerefreshpg}>
          <Image
            style={styles.refreshpg}
            source={require("../../assets/refresh_black.png")}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Sem Lançamento</Text>
     
      <ScrollView showsVerticalScrollIndicator={false}>{option}</ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "#65bafc",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 24,
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
  // input: {
  //   width: "90%",
  //   height: 60,
  //   backgroundColor: "#65bafc",
  //   borderRadius: 4,
  //   paddingHorizontal: 8,
  //   textAlign: "center",
  //   fontSize: 22,
  //   color: "#FFF",
  // },
  button: {
    width: "90%",
    height: 40,
    backgroundColor: "#007ddd",
    borderRadius: 4,
    marginVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
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
    borderTopColor: "#007ddd",
  },
  item: {
    margin: 18,
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
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
});

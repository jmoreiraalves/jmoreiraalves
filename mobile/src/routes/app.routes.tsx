import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Dashboard from '../pages/Dashboard';
import Order from '../pages/Order'
import FinishOrder from '../pages/FinishOrder'
import RelMetaAbaixo from '../pages/RelMetaAbaixo'
import SemLancamento from '../pages/SemLancamento'
import ResumoFunil from '../pages/ResumoFunil'
import ResumoFunilDetalhe from '../pages/ResumoFunilDetalhe'

export type StackPramsList = {
  Dashboard: undefined;
  Order: {
    number: number | string;
    order_id: string;
  };
  FinishOrder: {
    number: number | string;
    order_id: string;
  };
  RelMetaAbaixo: undefined;
  SemLancamento: undefined;
  ResumoFunil:undefined;
  ResumoFunilDetalhe: {
      headofficeid:  number | string;
      unitid: number | string;
      canalid: number | string;
      startdate: string;
      enddate: string;
  }
};

const Stack = createNativeStackNavigator<StackPramsList>();

function AppRoutes(){
  return(
    <Stack.Navigator>
      <Stack.Screen 
        name="Dashboard" 
        component={Dashboard} 
        options={{ headerShown: false }}
      />

      <Stack.Screen 
        name="RelMetaAbaixo" 
        component={RelMetaAbaixo} 
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="SemLancamento"
        component={SemLancamento}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ResumoFunil"
        component={ResumoFunil}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ResumoFunilDetalhe"
        component={ResumoFunilDetalhe}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Order"
        component={Order}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="FinishOrder"
        component={FinishOrder}
        options={{
          title: 'Finalizando',
          headerStyle:{
            backgroundColor: '#1d1d2e'
          },
          headerTintColor: '#FFF'
        }}
      />
    </Stack.Navigator>
  )
}

export default AppRoutes;


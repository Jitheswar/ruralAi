import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PatientListScreen from '../screens/PatientListScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="OTP"
        component={OTPScreen}
        options={{ headerShown: true, title: 'Verify OTP' }}
      />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PatientList"
        component={PatientListScreen}
        options={{ title: 'Patients' }}
      />
      <Stack.Screen
        name="AddPatient"
        component={AddPatientScreen}
        options={{ title: 'Add Patient' }}
      />
      <Stack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{ title: 'Patient Details' }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

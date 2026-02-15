import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OTPScreen from '../screens/OTPScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PatientListScreen from '../screens/PatientListScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import SymptomCheckerScreen from '../screens/SymptomCheckerScreen';
import VoiceInputScreen from '../screens/VoiceInputScreen';
import PrescriptionOCRScreen from '../screens/PrescriptionOCRScreen';
import SahayakScreen from '../screens/SahayakScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import VitalsInputScreen from '../screens/VitalsInputScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: true, title: 'Login' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: true, title: 'Create Account' }}
      />
      <Stack.Screen
        name="OTP"
        component={OTPScreen}
        options={{ headerShown: true, title: 'Verify Email' }}
      />
      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{ headerShown: true, title: 'Complete Profile' }}
      />
    </Stack.Navigator>
  );
}

function AppStack() {
  const { t } = useLanguage();

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
        options={{ title: t('nav.patients') }}
      />
      <Stack.Screen
        name="AddPatient"
        component={AddPatientScreen}
        options={{ title: t('patient.addPatient') }}
      />
      <Stack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{ title: t('nav.patients') }}
      />
      <Stack.Screen
        name="SymptomChecker"
        component={SymptomCheckerScreen}
        options={{ title: t('symptom.checkSymptoms') }}
      />
      <Stack.Screen
        name="VoiceInput"
        component={VoiceInputScreen}
        options={{ title: t('nav.voiceInput') }}
      />
      <Stack.Screen
        name="PrescriptionOCR"
        component={PrescriptionOCRScreen}
        options={{ title: t('prescription.scan') }}
      />
      <Stack.Screen
        name="Sahayak"
        component={SahayakScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VitalsInput"
        component={VitalsInputScreen}
        options={{ title: t('patient.vitals') }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});

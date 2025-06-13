import { Stack } from 'expo-router';

export default function ScanLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Scanner'
        }} 
      />
      <Stack.Screen 
        name="qr" 
        options={{ 
          title: 'QR Scanner',
          presentation: 'modal'
        }} 
      />
    </Stack>
  );
} 
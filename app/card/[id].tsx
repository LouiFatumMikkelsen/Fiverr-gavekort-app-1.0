import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GiftCard {
  id: string;
  store: string;
  amount: string;
  expiryDate: string;
  cardNumber: string;
}

// Samme farvefunktion som i index.tsx
const getCardColor = (storeName: string) => {
  const colors = [
    '#1e3a8a', // Mørkeblå
    '#047857', // Mørkegrøn
    '#7c3aed', // Lilla
    '#b91c1c', // Mørkerød
    '#0369a1', // Ocean blå
  ];
  const index = storeName.length % colors.length;
  return colors[index];
};

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [card, setCard] = useState<GiftCard | null>(null);

  useEffect(() => {
    loadCard();
  }, []);

  const loadCard = async () => {
    try {
      const savedCards = await AsyncStorage.getItem('giftCards');
      if (savedCards) {
        const cards = JSON.parse(savedCards);
        const foundCard = cards.find((c: GiftCard) => c.id === id);
        if (foundCard) {
          setCard(foundCard);
        }
      }
    } catch (error) {
      console.error('Fejl ved indlæsning af kort:', error);
    }
  };

  const deleteCard = async () => {
    Alert.alert(
      "Slet gavekort",
      "Er du sikker på, at du vil slette dette gavekort?",
      [
        { text: "Annuller" },
        {
          text: "Slet",
          style: "destructive",
          onPress: async () => {
            try {
              const savedCards = await AsyncStorage.getItem('giftCards');
              if (savedCards) {
                const cards = JSON.parse(savedCards);
                const updatedCards = cards.filter((c: GiftCard) => c.id !== id);
                await AsyncStorage.setItem('giftCards', JSON.stringify(updatedCards));
                router.back();
              }
            } catch (error) {
              Alert.alert("Fejl", "Kunne ikke slette gavekortet");
            }
          }
        }
      ]
    );
  };

  if (!card) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getCardColor(card.store) }]}>
      <StatusBar barStyle="light-content" />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.cardInfo}>
          <Text style={styles.storeName}>{card.store}</Text>
          <Text style={styles.amount}>{card.amount} kr</Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Kortnummer</Text>
            <Text style={styles.value}>{card.cardNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Udløbsdato</Text>
            <Text style={styles.value}>
              {new Date(card.expiryDate).toLocaleDateString('da-DK')}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={deleteCard}
        >
          <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.8)" />
          <Text style={styles.deleteButtonText}>Slet gavekort</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cardInfo: {
    marginTop: 40,
    marginBottom: 40,
  },
  storeName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  details: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
  },
  detailRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 'auto',
    marginBottom: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 
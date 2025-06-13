import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GiftCardListScreen from '@/components/giftCardListScreen';

interface GiftCard {
  id: string;
  store: string;
  amount: string;
  expiryDate: Date;
  cardNumber: string;
  logoUrl?: string;
  type: string;
  value: { text: string; color: string };
}

export default function MineKortScreen() {
  const router = useRouter();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);

  const loadGiftCards = async () => {
    try {
      const savedCards = await AsyncStorage.getItem('giftCards');
      console.log('Indlæste kort:', savedCards);
      if (savedCards) {
        const cards = JSON.parse(savedCards);
        setGiftCards(cards);
        console.log('Kort sat i state:', cards);
      }
    } catch (error) {
      console.error('Fejl ved indlæsning af gavekort:', error);
    }
  };

  const checkStorage = async () => {
    const savedCards = await AsyncStorage.getItem('giftCards');
    console.log('Gemte kort:', savedCards);
  };

  useFocusEffect(
    useCallback(() => {
      loadGiftCards();
      checkStorage();
    }, [])
  );

  const deleteCard = async (cardId: string) => {
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
              // Opdater state først
              const newCards = giftCards.filter(card => card.id !== cardId);
              setGiftCards(newCards);
              
              // Gem til storage bagefter
              await AsyncStorage.setItem('giftCards', JSON.stringify(newCards));
              
              // Vis bekræftelse
              Alert.alert("Gavekort slettet");
            } catch (error) {
              Alert.alert("Fejl", "Kunne ikke slette gavekortet");
            }
          }
        }
      ]
    );
  };

  const showAddOptions = () => {
    Alert.alert(
      "Tilføj gavekort",
      "Vælg hvordan du vil tilføje dit gavekort",
      [
        {
          text: "Scan QR-kode",
          onPress: () => router.push("/scan/qr")
        },
        {
          text: "Indtast manuelt",
          onPress: () => router.push("/scan/manual")
        },
        {
          text: "Annuller",
          style: "cancel"
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Kort</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={showAddOptions}
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <GiftCardListScreen/>

      {/* <ScrollView style={styles.cardList}>
        <View style={styles.cardGrid}>
          {giftCards.map((card) => (
            <TouchableOpacity 
              key={card.id} 
              style={styles.card}
              onPress={() => router.push(`/card/${card.id}`)}
            >
              <View style={styles.cardContent}>
                <Text style={styles.storeName}>{card.store}</Text>
                <Text style={styles.amount}>{card.amount} kr</Text>
                <Text style={styles.date}>
                  {new Date(card.expiryDate).toLocaleDateString('da-DK')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#0A3D91',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  storeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  amount: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.7,
  }
});

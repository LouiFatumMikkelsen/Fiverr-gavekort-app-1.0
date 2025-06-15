import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Easing,
  Pressable,
  Image,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Barcode } from "expo-barcode-generator";
import QRCode from "react-native-qrcode-svg";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

declare module 'expo-barcode-generator';

const { width, height } = Dimensions.get('window');

interface GiftCard {
  id: string;
  store: string;
  amount: string;
  code?: string;
  type: "qr" | "bar";
  raw: string;
  dateAdded: string;
  expiryDate?: string;
}

// Liste over populære butikker og deres domæner og farver
const storeDomains: { name: string; domain: string; color: string[] }[] = [
  { name: 'Matas', domain: 'matas.dk', color: ['#1e3a8a', '#3498db'] },
  { name: 'H&M', domain: 'hm.com', color: ['#b91c1c', '#f87171'] },
  { name: 'Zalando', domain: 'zalando.dk', color: ['#ff6900', '#ffb380'] },
  { name: 'Magasin', domain: 'magasin.dk', color: ['#1e293b', '#64748b'] },
  { name: 'Bilka', domain: 'bilka.dk', color: ['#0369a1', '#60a5fa'] },
  { name: 'Føtex', domain: 'foetex.dk', color: ['#0f172a', '#334155'] },
  { name: 'Netto', domain: 'netto.dk', color: ['#fde047', '#facc15'] },
  { name: 'Rema 1000', domain: 'rema1000.dk', color: ['#2563eb', '#60a5fa'] },
  { name: 'Normal', domain: 'normal.dk', color: ['#0d9488', '#5eead4'] },
  { name: 'Imerco', domain: 'imerco.dk', color: ['#334155', '#cbd5e1'] },
  { name: 'Lidl', domain: 'lidl.dk', color: ['#1e40af', '#facc15'] },
  { name: 'Boulders', domain: 'boulders.dk', color: ['#f97316', '#fbbf24'] },
  // Tilføj flere efter behov
];

function getStoreData(storeName: string) {
  if (!storeName) return null;
  const lower = storeName.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  for (const s of storeDomains) {
    const score = s.name.toLowerCase() === lower ? 2 : s.name.toLowerCase().includes(lower) || lower.includes(s.name.toLowerCase()) ? 1 : 0;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = s;
    }
  }
  return bestMatch;
}

export default function GiftCardListScreen() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const mainScreenTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadGiftCards = async () => {
      const storedCards = await AsyncStorage.getItem("giftCards");
      if (storedCards) {
        setGiftCards(JSON.parse(storedCards));
      }
    };
    loadGiftCards();
  }, []); 

  const openBottomSheet = (card: GiftCard) => {
    setSelectedCard(card);
    setBottomSheetVisible(true);
    Animated.parallel([
      Animated.timing(animation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(mainScreenTranslate, {
        toValue: -20,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      })
    ]).start();
  };

  const closeBottomSheet = () => {
    Animated.parallel([
      Animated.timing(animation, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(mainScreenTranslate, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      })
    ]).start(() => {
      setBottomSheetVisible(false);
      setSelectedCard(null);
    });
  };

  const deleteCard = async (id: string) => {
    const updatedCards = giftCards.filter(card => card.id !== id);
    setGiftCards(updatedCards);
    await AsyncStorage.setItem("giftCards", JSON.stringify(updatedCards));
    closeBottomSheet();
  };

  const renderItem = ({ item }: { item: GiftCard }) => {
    const storeData = getStoreData(item.store);
    const logoUrl = storeData ? `https://img.logo.dev/${storeData.domain}?token=pk_HJ2cYOIQThSJBu9IIq_ang` : null;
    const gradientColors = storeData ? storeData.color : ['#2c3e50', '#3498db'];
    return (
      <TouchableOpacity onPress={() => openBottomSheet(item)} activeOpacity={0.92} style={styles.cardContainer}>
        <LinearGradient
          colors={gradientColors}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.cardLogo} resizeMode="contain" />
          ) : null}
          <Text style={styles.cardStore} numberOfLines={1} ellipsizeMode="tail">{item.store}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderBottomSheet = () => {
    if (!selectedCard) return null;

    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [height, height * 0.1]
    });
    const scale = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.98, 1]
    });

    return (
      <Modal
        visible={bottomSheetVisible}
        transparent
        animationType="none"
        onRequestClose={closeBottomSheet}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeBottomSheet} />
          <Animated.View 
            style={[
              styles.bottomSheet,
              {
                transform: [
                  { translateY },
                  { scale }
                ]
              }
            ]}
          >
            <View style={styles.bottomSheetHandle} />
            <View style={styles.bottomSheetHeader}>
              <View style={styles.bottomSheetTitle}>
                <MaterialIcons name="store" size={24} color="#2c3e50" />
                <Text style={styles.bottomSheetStore}>{selectedCard.store}</Text>
              </View>
              <TouchableOpacity 
                onPress={closeBottomSheet}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSheetContent}>
              <View style={styles.codeContainer}>
                <View style={styles.codeHeader}>
                  <MaterialIcons 
                    name={selectedCard.type === "qr" ? "qr-code-2" : "barcode-scan"} 
                    size={20} 
                    color="#2c3e50" 
                  />
                  <Text style={styles.codeTitle}>
                    {selectedCard.type === "qr" ? "QR Kode" : "Stregkode"}
                  </Text>
                </View>
                <ShowCode
                  content={selectedCard.raw}
                  codeType={selectedCard.type === "qr" ? "qr" : "bar"}
                />
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <MaterialIcons name="attach-money" size={20} color="#2c3e50" />
                  <Text style={styles.detailText}>Beløb: {selectedCard.amount}</Text>
                </View>
                {selectedCard.code && (
                  <View style={styles.detailRow}>
                    <MaterialIcons name="key" size={20} color="#2c3e50" />
                    <Text style={styles.detailText}>Kode: {selectedCard.code}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <MaterialIcons name="event" size={20} color="#2c3e50" />
                  <Text style={styles.detailText}>
                    Tilføjet: {new Date(selectedCard.dateAdded).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialIcons name="event-available" size={20} color="#2c3e50" />
                  <Text style={styles.detailText}>
                    Udløber: {selectedCard.expiryDate ? new Date(selectedCard.expiryDate).toLocaleDateString('da-DK') : '-'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteCard(selectedCard.id)}>
                  <Text style={styles.deleteButtonText}>Slet gavekort</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <Animated.View style={{ flex: 1, transform: [{ translateY: mainScreenTranslate }] }}>
      <View style={styles.container}>
        <FlatList
          key={2}
          data={giftCards}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.cardRow}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="card-giftcard" size={64} color="#3498db" />
              <Text style={styles.emptyText}>Ingen gemte gavekort</Text>
              <Text style={styles.emptySubText}>Tilføj dit første gavekort ved at scanne det</Text>
            </View>
          }
        />
        {renderBottomSheet()}
      </View>
    </Animated.View>
  );
}

function ShowCode({
  content,
  codeType,
}: {
  content: string;
  codeType: "bar" | "qr";
}) {
  return (
    <View style={styles.codeWrapper}>
      {codeType === "bar" ? (
        <Barcode
          value={content}
          rotation={0}
          height={60}
          width={200}
          options={{ background: "white" }}
        />
      ) : (
        <QRCode 
          value={content}
          size={120}
          backgroundColor="white"
          color="#000"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 0,
  },
  listContainer: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardContainer: {
    width: '48%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 0,
    height: 100,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cardLogo: {
    width: 36,
    height: 36,
    marginBottom: 8,
    borderRadius: 8,
  },
  cardStore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: height * 0.9,
    maxHeight: height * 0.9,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bottomSheetTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomSheetStore: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  bottomSheetContent: {
    padding: 20,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  codeWrapper: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    color: "#2c3e50",
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 8,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f87171',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

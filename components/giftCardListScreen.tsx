import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Barcode } from "expo-barcode-generator";
import QRCode from "react-native-qrcode-svg";
export default function GiftCardListScreen() {
  const [giftCards, setGiftCards] = useState([]);
  console.log("card data :", giftCards);
  console.log();
  useEffect(() => {
    const loadGiftCards = async () => {
      const storedCards = await AsyncStorage.getItem("giftCards");
      if (storedCards) {
        setGiftCards(JSON.parse(storedCards));
      }
    };
    loadGiftCards();
  }, []); 
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <ShowCode
        content={item.raw}
        codeType={item.type === "qr" ? "qr" : "bar"}
      />
      <View style={styles.details}>
        <Text style={styles.store}>{item.store}</Text>
        <Text style={styles.amount}>Beløb: {item.amount}</Text>
        {item.code ? <Text style={styles.code}>Kode: {item.code}</Text> : null}
        <Text style={styles.date}>
          Tilføjet: {new Date(item.dateAdded).toLocaleDateString()}
        </Text>
        <Text style={styles.raw}>Rå data: {item.raw}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={giftCards}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Ingen gemte gavekort</Text>
        }
      />
    </View>
  );
}

function ShowCode({
  content,
  codeType,
}: {
  content: string;
  codeType: "bar" | "qr";
}) {
  return codeType === "bar" ? (
    <Barcode
      value="123456789999"
      rotation={0}
      height={30}
      width={30}
      options={{ background: "lightblue" }}
    />
  ) : (
    <QRCode value={content} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f4f4f4",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  snapshot: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  noSnapshot: {
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  store: {
    fontSize: 16,
    fontWeight: "bold",
  },
  amount: {
    fontSize: 14,
    color: "#333",
  },
  code: {
    fontSize: 14,
    color: "#555",
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  raw: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 32,
  },
  scanButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  scanButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useCameraPermissions, CameraView } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';

function FloatingLabelInput({ label, value, onChangeText, ...props }: { label: string; value: string; onChangeText: (text: string) => void; [key: string]: any }) {
  const [isFocused, setIsFocused] = useState(false);
  const showLabel = isFocused || value;
  return (
    <View style={{ marginVertical: 12 }}>
      <Text
        style={{
          position: 'absolute',
          left: 14,
          top: showLabel ? 2 : 20,
          fontSize: showLabel ? 13 : 17,
          color: showLabel ? '#007AFF' : '#888',
          backgroundColor: showLabel ? '#fff' : 'transparent',
          paddingHorizontal: 2,
          zIndex: 2,
          fontWeight: showLabel ? '600' : '400',
        }}
      >
        {label}
      </Text>
      <TextInput
        style={styles.floatingInput}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    </View>
  );
}

export default function QRScreen() {
  const router = useRouter();
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [store, setStore] = useState("");
  const [amount, setAmount] = useState("");
  const [code, setCode] = useState("");
  const [codeType, setCodeType] = useState("");
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const isFocused = useIsFocused();
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.buttonText}>
          Vi har brug for din tilladelse til at bruge kameraet
        </Text>
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Giv tilladelse</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data, type }: { data: string; type: string }) => {
    if (!scanned) {
      setScanned(true);

      try {
        // Parse the data if structured
        setScannedData(data);
        if (data.includes("/") && data.split("/").length === 3) {
          const [parsedStore, parsedAmount, parsedCode] = data.split("/");
          setStore(parsedStore);
          setAmount(parsedAmount);
          setCode(parsedCode);
          setCodeType(type);
        } else {
          setStore("");
          setAmount("");
          setCode("");
        }

        setModalVisible(true);
      } catch (error) {
        console.warn("Kunne ikke tage billede:", error);
        Alert.alert("Fejl", "Kunne ikke tage billede.");
        setScanned(false);
      }
    }
  };

  const saveGiftCard = async () => {
    try {
      const existingCards = await AsyncStorage.getItem("giftCards");
      const cards = existingCards ? JSON.parse(existingCards) : [];

      const newCard = {
        id: Date.now().toString(),
        store: store || "Ukendt butik",
        amount: amount || "0",
        code: code || "",
        raw: scannedData,
        dateAdded: new Date().toISOString(),
        type: codeType,
        expiryDate: expiryDate.toISOString(),
      };
      console.log("new card :", newCard);

      cards.push(newCard);
      await AsyncStorage.setItem("giftCards", JSON.stringify(cards));

      setModalVisible(false);
      Alert.alert("Succes", "Gavekortet er gemt!", [
        { text: "OK", onPress: () => router.push("/(tabs)") },
      ]);
    } catch (error) {
      Alert.alert("Fejl", "Kunne ikke gemme gavekortet");
    }
  };

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarCodeScanned}
        />
      )}

      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.scanArea}>
          <Text style={styles.scanText}>Placér QR-koden i midten</Text>
        </View>
      </View>

      {scanned && (
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => {
            setScanned(false);
            setScannedData("");
          }}
        >
          <Text style={styles.buttonText}>Scan igen</Text>
        </TouchableOpacity>
      )}

      {/* Modal with inputs */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QR-kode scannet</Text>
            <Text style={{ marginBottom: 8, fontSize: 12, color: "#666" }}>
              Rå data: {scannedData}
            </Text>
            <FloatingLabelInput
              label="Butik"
              value={store}
              onChangeText={setStore}
              autoCapitalize="words"
            />
            <FloatingLabelInput
              label="Beløb"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <FloatingLabelInput
              label="Kode"
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={expiryDate ? styles.dateLabelActive : styles.dateLabel}>Udløbsdato</Text>
              <Text style={styles.dateValue}>{expiryDate.toLocaleDateString('da-DK')}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setExpiryDate(selectedDate);
                }}
                minimumDate={new Date()}
                locale="da-DK"
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setModalVisible(false);
                  setScanned(false);
                }}
              >
                <Text style={styles.modalButtonText}>Annuller</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonSave}
                onPress={saveGiftCard}
              >
                <Text style={styles.modalButtonText}>Gem</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 16,
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 44,
  },
  scanArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
    borderRadius: 8,
  },
  scanAgainButton: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 16,
    width: "88%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
  },
  floatingInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 14,
    fontSize: 17,
    backgroundColor: '#f8f9fa',
    color: '#222',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalButtonCancel: {
    flex: 1,
    marginRight: 8,
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 8,
  },
  modalButtonSave: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: '#f8f9fa',
    marginVertical: 12,
  },
  dateLabel: {
    position: 'absolute',
    left: 14,
    top: 20,
    fontSize: 17,
    color: '#888',
    zIndex: 2,
  },
  dateLabelActive: {
    position: 'absolute',
    left: 14,
    top: 2,
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
    zIndex: 2,
  },
  dateValue: {
    fontSize: 17,
    color: '#222',
    marginTop: 2,
  },
});

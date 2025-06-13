import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoreLogo, getStoreDisplay } from '../lib/stores';

// Liste over butikker
const stores = [
  {
    id: '1',
    name: 'H&M',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/2560px-H%26M-Logo.svg.png'
  },
  {
    id: '2',
    name: 'Matas',
    logoUrl: 'https://matas.dk/images/logo.svg'
  },
  {
    id: '3',
    name: 'Magasin',
    logoUrl: 'https://www.magasin.dk/on/demandware.static/Sites-MagasinDK-Site/-/default/dw4e685572/images/logo.svg'
  },
  {
    id: '4',
    name: 'Føtex',
    logoUrl: 'https://www.foetex.dk/img/foetex-logo.png'
  },
  {
    id: '5',
    name: 'Bilka',
    logoUrl: 'https://www.bilka.dk/img/bilka-logo.png'
  },
  {
    id: '6',
    name: 'Normal',
    logoUrl: 'https://normal.dk/images/logo.png'
  },
  {
    id: '7',
    name: 'Imerco',
    logoUrl: 'https://www.imerco.dk/images/logo.svg'
  }
];

export default function ManualEntryScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    store: '',
    amount: '',
    expiryDate: new Date(),
    cardNumber: '',
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Søgefunktion
  const handleSearch = (text) => {
    console.log('Søger efter:', text);
    setFormData(prev => ({ ...prev, store: text }));
    
    if (text.length > 0) {
      const filtered = stores.filter(store => 
        store.name.toLowerCase().includes(text.toLowerCase())
      );
      console.log('Fandt butikker:', filtered);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Vælg butik fra forslag
  const handleStoreSelect = (store) => {
    // Brug displayName hvis det findes, ellers brug name
    const storeName = store.displayName || store.name;
    setFormData(prev => ({ ...prev, store: storeName }));
    setSuggestions([]);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.store || !formData.amount || !formData.cardNumber) {
        Alert.alert('Fejl', 'Udfyld venligst alle felter');
        return;
      }

      // Hent butikkens display information
      const storeDisplay = getStoreDisplay(formData.store);
      
      const newCard = {
        id: Date.now().toString(),
        store: formData.store,
        amount: formData.amount,
        expiryDate: formData.expiryDate.toISOString(),
        cardNumber: formData.cardNumber,
        type: storeDisplay.type,
        value: storeDisplay.value
      };

      const savedCards = await AsyncStorage.getItem('giftCards');
      const existingCards = savedCards ? JSON.parse(savedCards) : [];
      
      const updatedCards = [...existingCards, newCard];
      await AsyncStorage.setItem('giftCards', JSON.stringify(updatedCards));
      
      Alert.alert('Success', 'Gavekortet er gemt', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Fejl ved gemning:', error);
      Alert.alert('Fejl', 'Kunne ikke gemme gavekortet');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, expiryDate: selectedDate }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <MaterialIcons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Tilføj Gavekort</Text>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Butik</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              value={formData.store}
              onChangeText={handleSearch}
              placeholder="Søg efter butik..."
            />
            {suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((store) => (
                  <TouchableOpacity
                    key={store.id}
                    style={styles.suggestionItem}
                    onPress={() => handleStoreSelect(store)}
                  >
                    <Text style={styles.suggestionText}>{store.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Beløb</Text>
          <TextInput
            style={styles.input}
            value={formData.amount}
            onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
            placeholder="Indtast beløb"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Udløbsdato</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formData.expiryDate.toLocaleDateString('da-DK')}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.expiryDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
            locale="da-DK"
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kortnummer</Text>
          <TextInput
            style={styles.input}
            value={formData.cardNumber}
            onChangeText={(text) => setFormData(prev => ({ ...prev, cardNumber: text }))}
            placeholder="Indtast kortnummer"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Gem Gavekort</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    position: 'relative',
    zIndex: 1,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 16,
  },
}); 
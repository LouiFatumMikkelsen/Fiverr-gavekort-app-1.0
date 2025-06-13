import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ScanScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.push("/scan/qr")}
      >
        <Ionicons name="scan" size={24} color="#fff" />
        <Text style={styles.scanButtonText}>Scan kort</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scanButton: {
    backgroundColor: "#007AFF",
    padding: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});

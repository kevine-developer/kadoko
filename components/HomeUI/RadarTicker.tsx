import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const UPDATES = [
  { id: 1, user: "Sophie", action: "a créé", target: "Déco Salon", time: "2h" },
  {
    id: 2,
    user: "Marc",
    action: "a ajouté",
    target: "Apple Watch",
    time: "4h",
  },
  {
    id: 3,
    user: "Léa",
    action: "fête son",
    target: "Anniversaire",
    time: "J-3",
    urgent: true,
  },
];
const RadarTicker = () => (
  <BlurView
    intensity={80}
    blurReductionFactor={1}
    style={styles.radarContainer}
  >
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.radarContent}
    >
      <View style={styles.radarLabelContainer}>
        <Ionicons name="flash" size={12} color="#FFFFFF" />
        <Text style={styles.radarLabel}>LIVE</Text>
      </View>
      {UPDATES.map((item, index) => (
        <View key={item.id} style={styles.radarItem}>
          <Text style={styles.radarText}>
            <Text style={styles.radarUser}>{item.user}</Text>
            <Text style={{ opacity: 0.6 }}> {item.action} </Text>
            <Text style={styles.radarTarget}>{item.target}</Text>
          </Text>
          {index !== UPDATES.length - 1 && (
            <View style={styles.radarSeparator} />
          )}
        </View>
      ))}
    </ScrollView>
  </BlurView>
);

export default RadarTicker

const styles = StyleSheet.create({
  /* RADAR */
  radarContainer: {
    marginBottom: 24,
    paddingTop: 20,
    overflow: "hidden",
  },
  radarContent: {
    paddingHorizontal: 24,
    alignItems: "center",
    paddingVertical: 10,
  },
  radarLabelContainer: {
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 16,
    gap: 4,
  },
  radarLabel: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  radarItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  radarText: {
    fontSize: 14,
    color: "#374151",
  },
  radarUser: {
    fontWeight: "700",
    color: "#111827",
  },
  radarTarget: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  radarSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 12,
  },
})
import ButtonUI from "@/components/btn-ui";
import HeaderShowFalse from "@/components/HeaderCustom/HeaderShowFalse";
import InputUI from "@/components/InputUI";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { pickImage } from "@/lib/pickImage";
import { Ionicons } from "@expo/vector-icons"; // Optionnel : pour ajouter une icône
import { BlurView } from "expo-blur";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CreateEventScreen() {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [description, setDescription] = useState("");

  const navigation = useNavigation();

  return (
    <>
      <HeaderShowFalse />

      <ParallaxScrollView
        headerBackgroundColor={{ light: "#4a2488ff", dark: "#1E293B" }}
        headerImage={
          <TouchableOpacity
            style={styles.headerContainer}
            onPress={() => pickImage(setImageUri)}
            activeOpacity={0.8}
          >
            <BlurView intensity={80} tint="light" style={styles.backButtonBlur}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButtonInner}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#1a1a1a"
                  style={styles.backButtonIcon}
                />
              </TouchableOpacity>
            </BlurView>
            {imageUri ? (
              <>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.headerImageFull}
                />
                {/* Petit badge pour indiquer qu'on peut changer la photo */}
                <View style={styles.changeBadge}>
                  <Text style={styles.changeBadgeText}>MODIFIER</Text>
                </View>
              </>
            ) : (
              <View style={styles.headerPlaceholder}>
                <Ionicons name="camera-outline" size={40} color="white" />
                <Text style={styles.headerText}>AJOUTER UNE PHOTO</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      >
        <ThemedView>
          <ThemedText style={styles.sectionTitle}>
            Quel est l&apos;événement ?
          </ThemedText>

          <ThemedView>
            <InputUI
              label="Nom du cadeau"
              value={name}
              onChangeText={setName}
              placeholder="Ex: PlayStation 5..."
            />
            <InputUI
              label="Lien (Optionnel)"
              value={link}
              onChangeText={setLink}
              placeholder="https://..."
              keyboardType="url"
            />
            <InputUI
              label="Petite note"
              value={description}
              onChangeText={setDescription}
              placeholder="Détails..."
              multiline
            />
          </ThemedView>

          <ButtonUI
            title="ENREGISTRER LE CADEAU"
            onPress={() => console.log("Submit")}
            variant="secondary"
            styleContainer={{ marginTop: 24, marginBottom: 50 }}
          />
        </ThemedView>
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  headerImageFull: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7C3AED",
  },
  headerText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
    marginTop: 10,
    letterSpacing: 1,
  },
  changeBadge: {
    position: "absolute",
    bottom: 40,
    right: 70,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  backButtonBlur: {
    position: "absolute",
    top: 70,
    left: 50,
    zIndex: 10,

    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#616060ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonInner: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonIcon: {
    backgroundColor: "#88888844",
    borderRadius: 20,
    padding: 4,
  },
});

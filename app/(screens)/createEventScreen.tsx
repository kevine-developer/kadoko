import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker"; // npx expo install expo-image-picker
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // npx expo install react-native-modal-datetime-picker

// --- THEME ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827",
  border: "#E5E7EB",
};

const EVENT_TYPES = [
  { id: "BIRTHDAY", label: "Anniversaire", icon: "gift-outline" },
  { id: "CHRISTMAS", label: "Noël", icon: "snow-outline" },
  { id: "WEDDING", label: "Mariage", icon: "heart-outline" },
  { id: "HOUSE", label: "Crémaillère", icon: "home-outline" },
  { id: "OTHER", label: "Autre", icon: "star-outline" },
];

export default function CreateWishlistScreen() {
  const insets = useSafeAreaInsets();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("BIRTHDAY");
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Date State
  const [date, setDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // --- HANDLERS ---

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleCreate = () => {
    if (!title) return;

    // TODO: Appel API vers Hono (POST /api/wishlists)
    console.log({
      title,
      description,
      eventType,
      visibility: isPrivate ? "PRIVATE" : "PUBLIC",
      eventDate: date,
      coverImage,
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* NAVBAR */}
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="close" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Nouvelle Collection</Text>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!title}
          style={[styles.createBtn, !title && styles.createBtnDisabled]}
        >
          <Text style={[styles.createBtnText, !title && { color: "#D1D5DB" }]}>
            Créer
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 1. COVER IMAGE PICKER */}
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={pickImage}
            activeOpacity={0.9}
          >
            {coverImage ? (
              <>
                <Image
                  source={{ uri: coverImage }}
                  style={styles.coverImage}
                  contentFit="cover"
                />
                <View style={styles.editImageBadge}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                </View>
              </>
            ) : (
              <View style={styles.placeholderContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="image-outline"
                    size={32}
                    color={THEME.textSecondary}
                  />
                </View>
                <Text style={styles.placeholderText}>
                  Ajouter une couverture
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 2. MAIN INFO */}
          <View style={styles.section}>
            <Text style={styles.label}>TITRE</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Ex: Mes 30 ans 🎂"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.label, { marginTop: 24 }]}>
              DESCRIPTION (OPTIONNEL)
            </Text>
            <TextInput
              style={styles.descInput}
              placeholder="Une petite note pour vos proches..."
              placeholderTextColor="#9CA3AF"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.divider} />

          {/* 3. TYPE D'ÉVÉNEMENT */}
          <View style={styles.section}>
            <Text style={styles.label}>OCCASION</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillScroll}
            >
              {EVENT_TYPES.map((type) => {
                const isSelected = eventType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.pill, isSelected && styles.pillSelected]}
                    onPress={() => setEventType(type.id)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={16}
                      color={isSelected ? "#FFF" : THEME.textMain}
                    />
                    <Text
                      style={[
                        styles.pillText,
                        isSelected && styles.pillTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.divider} />

          {/* 4. DATE & VISIBILITÉ */}
          <View style={styles.section}>
            {/* Date Picker Trigger */}
            <TouchableOpacity
              style={styles.rowItem}
              onPress={() => setDatePickerVisibility(true)}
            >
              <View style={styles.rowLeft}>
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={THEME.textMain}
                />
                <Text style={styles.rowLabel}>Date de l'événement</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>
                  {date ? date.toLocaleDateString("fr-FR") : "Définir"}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </View>
            </TouchableOpacity>

            {/* Visibility Switch */}
            <View style={[styles.rowItem, { borderBottomWidth: 0 }]}>
              <View style={styles.rowLeft}>
                <Ionicons
                  name={isPrivate ? "lock-closed-outline" : "globe-outline"}
                  size={22}
                  color={THEME.textMain}
                />
                <View>
                  <Text style={styles.rowLabel}>Liste Privée</Text>
                  <Text style={styles.rowSubLabel}>
                    {isPrivate
                      ? "Visible uniquement par vous"
                      : "Visible par vos amis"}
                  </Text>
                </View>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: "#E5E7EB", true: THEME.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL DATE PICKER */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(d) => {
          setDate(d);
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
        confirmTextIOS="Valider"
        cancelTextIOS="Annuler"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    backgroundColor: THEME.background,
  },
  navBtn: {
    padding: 8,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },
  createBtn: {
    padding: 8,
  },
  createBtnDisabled: {
    opacity: 0.5,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.primary,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* IMAGE PICKER */
  imagePicker: {
    height: 200,
    backgroundColor: "#F3F4F6",
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: THEME.textSecondary,
    fontWeight: "600",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  editImageBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
  },

  /* SECTIONS */
  section: {
    paddingHorizontal: 24,
    marginVertical: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 28,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
  },
  descInput: {
    fontSize: 16,
    color: THEME.textMain,
    lineHeight: 24,
    minHeight: 60,
  },
  divider: {
    height: 8,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },

  /* PILLS */
  pillScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },
  pillSelected: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textMain,
  },
  pillTextSelected: {
    color: "#FFFFFF",
  },

  /* ROWS */
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: THEME.textMain,
  },
  rowSubLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowValue: {
    fontSize: 15,
    color: THEME.primary,
    fontWeight: "600",
  },
});

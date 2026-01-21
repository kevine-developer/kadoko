import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker"; // Assurez-vous d'être sur une version récente
import { router, useLocalSearchParams } from "expo-router";
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
import { giftService } from "../../../lib/services/gift-service";
import { uploadService } from "../../../lib/services/upload-service";

// --- THEME ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827",
  border: "#E5E7EB",
  eco: "#577B67", // Vert Sauge
  danger: "#EF4444",
};

// --- DATA ---
const PRIORITIES = [
  { id: "ESSENTIAL", label: "Indispensable", icon: "star" },
  { id: "DESIRED", label: "Plaisir", icon: "heart" },
  { id: "OPTIONAL", label: "Si possible", icon: "thumbs-up" },
];

export default function AddGiftScreen() {
  const { wishlistId } = useLocalSearchParams<{ wishlistId: string }>();
  const insets = useSafeAreaInsets();

  // --- FORM STATE ---
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const [priority, setPriority] = useState("");
  const [acceptsSecondHand, setAcceptsSecondHand] = useState(false);
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState(false);

  // --- HANDLERS ---
  const validateUrl = (text: string) => {
    setUrl(text);
    if (!text) {
      setUrlError(false);
      return;
    }
    try {
      new URL(text.startsWith("http") ? text : `https://${text}`);
      setUrlError(false);
    } catch (e) {
      setUrlError(true);
    }
  };

  const pickImage = async () => {
    // ✅ CORRECTION ICI : Utilisation de MediaType.Images
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !wishlistId) return;

    setLoading(true);
    try {
      let finalImageUrl = image;

      // Si l'image est locale (URI), on l'upload
      if (image && !image.startsWith("http")) {
        const uploadedUrl = await uploadService.uploadImage(image, "gifts");
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      const finalUrl = url && !url.startsWith("http") ? `https://${url}` : url;

      const payload = {
        title,
        productUrl: finalUrl,
        imageUrl: finalImageUrl,
        estimatedPrice: price ? parseFloat(price) : null,
        priority: priority || "DESIRED",
        description,
        acceptsSecondHand,
      };

      const result = await giftService.addGift(wishlistId, payload);

      if (result.success) {
        alert("Cadeau ajouté avec succès !");
        router.back();
      } else {
        alert("Erreur lors de l'ajout du cadeau");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="close" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter une envie</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!title.trim() || loading}
          style={[
            styles.saveBtn,
            (!title.trim() || loading) && styles.saveBtnDisabled,
          ]}
        >
          <Text style={styles.saveBtnText}>
            {loading ? "Ajout..." : "Ajouter"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. URL INPUT */}
          <View
            style={[
              styles.urlInputContainer,
              urlError && { borderColor: THEME.danger },
            ]}
          >
            <Ionicons
              name="link-outline"
              size={20}
              color={urlError ? THEME.danger : THEME.textSecondary}
            />
            <TextInput
              style={styles.urlInput}
              placeholder="Coller un lien (Amazon, Etsy...)"
              placeholderTextColor="#9CA3AF"
              value={url}
              onChangeText={validateUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {urlError && (
            <Text style={styles.errorText}>Vérifiez le format du lien</Text>
          )}

          {/* 2. IMAGE PICKER */}
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {image ? (
              <>
                <Image
                  source={{ uri: image }}
                  style={styles.uploadedImage}
                  contentFit="cover"
                />
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={14} color="#FFF" />
                </View>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="camera-outline"
                  size={32}
                  color={THEME.textSecondary}
                />
                <Text style={styles.imagePlaceholderText}>
                  Ajouter une photo
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 3. MAIN INFO */}
          <View style={styles.section}>
            <Text style={styles.label}>TITRE DU CADEAU</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Ex: Casque Sony XM5"
              placeholderTextColor="#D1D5DB"
              multiline
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* 4. PRICE & PRIORITY */}
          <View style={styles.rowSection}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>PRIX ESTIMÉ</Text>
              <View style={styles.priceWrapper}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor="#D1D5DB"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
                <Text style={styles.currency}>€</Text>
              </View>
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>PRIORITÉ</Text>
              <View style={styles.priorityContainer}>
                {PRIORITIES.map((p) => {
                  const isActive = priority === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.priorityPill,
                        isActive && styles.priorityPillActive,
                      ]}
                      onPress={() => setPriority(p.id)}
                    >
                      <Ionicons
                        name={p.icon as any}
                        size={12}
                        color={isActive ? "#FFF" : THEME.textMain}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.priorityLabel}>
                {PRIORITIES.find((p) => p.id === priority)?.label}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 5. NOTES & DESCRIPTION */}
          <View style={styles.section}>
            <Text style={styles.label}>NOTES / TAILLE / COULEUR</Text>
            <TextInput
              style={styles.descInput}
              placeholder="Précisions utiles pour l'acheteur..."
              placeholderTextColor="#9CA3AF"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.divider} />

          {/* 6. OPTIONS AVANCÉES (Seconde Main) */}
          <View style={styles.optionRow}>
            <View style={styles.optionTextContainer}>
              <View style={styles.optionHeader}>
                <Ionicons name="leaf-outline" size={18} color={THEME.eco} />
                <Text style={styles.optionTitle}>Seconde main acceptée</Text>
              </View>
              <Text style={styles.optionDesc}>
                Indique que vous êtes ouvert au reconditionné ou à
                l&apos;occasion.
              </Text>
            </View>
            <Switch
              value={acceptsSecondHand}
              onValueChange={setAcceptsSecondHand}
              trackColor={{ false: "#E5E7EB", true: THEME.eco }}
              thumbColor="#FFF"
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: THEME.background,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  navBtn: { padding: 8 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  saveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: THEME.primary,
    borderRadius: 20,
  },
  saveBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  saveBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },

  scrollContent: {
    padding: 24,
  },

  /* URL INPUT */
  urlInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 24,
    gap: 12,
  },
  urlInput: {
    flex: 1,
    fontSize: 15,
    color: THEME.textMain,
  },

  /* IMAGE PICKER */
  imagePicker: {
    height: 220,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  editBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
  },
  imagePlaceholder: {
    alignItems: "center",
    gap: 8,
  },
  imagePlaceholderText: {
    color: THEME.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },

  /* SECTIONS */
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    textTransform: "uppercase",
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
    textAlignVertical: "top",
  },

  /* ROW SECTION (Price & Priority) */
  rowSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 8,
  },
  halfInput: {
    flex: 1,
  },
  priceWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
  },
  priceInput: {
    fontSize: 24,
    fontWeight: "600",
    color: THEME.textMain,
    flex: 1,
  },
  currency: {
    fontSize: 18,
    color: THEME.textSecondary,
    fontWeight: "600",
  },

  /* PRIORITY SELECTOR */
  priorityContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  priorityPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    justifyContent: "center",
    alignItems: "center",
  },
  priorityPillActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  priorityLabel: {
    fontSize: 12,
    color: THEME.textMain,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 24,
  },

  /* OPTION ROW (ECO) */
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: THEME.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.textMain,
  },
  optionDesc: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 16,
  },
  errorText: {
    color: THEME.danger,
    fontSize: 12,
    marginTop: -16,
    marginBottom: 16,
    marginLeft: 4,
    fontWeight: "600",
  },
});

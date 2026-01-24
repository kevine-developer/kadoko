import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
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
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { giftService } from "../../../lib/services/gift-service";
import { uploadService } from "../../../lib/services/upload-service";

// --- THEME ÉDITORIAL ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.06)",
  eco: "#4A6741", // Vert forêt profond
  danger: "#C34A4A",
  primary: "#AF9062",
};

const PRIORITIES = [
  { id: "ESSENTIAL", label: "Indispensable", icon: "star" },
  { id: "DESIRED", label: "Envie", icon: "heart" },
  { id: "OPTIONAL", label: "Idée", icon: "bulb-outline" },
];

export default function AddGiftScreen() {
  const { wishlistId, giftId } = useLocalSearchParams<{
    wishlistId: string;
    giftId?: string;
  }>();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("DESIRED");
  const [acceptsSecondHand, setAcceptsSecondHand] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!giftId);

  const loadInitialData = React.useCallback(async () => {
    setFetching(true);
    const res = await giftService.getGiftById(giftId!);
    if (res.success && "gift" in res) {
      const g = res.gift;
      setTitle(g.title);
      setUrl(g.productUrl || "");
      setPrice(g.estimatedPrice?.toString() || "");
      setImage(g.imageUrl || null);
      setDescription(g.description || "");
      setPriority(g.priority || "DESIRED");
      setAcceptsSecondHand(g.acceptsSecondHand || false);
      setIsPublished(g.isPublished || false);
    }
    setFetching(false);
  }, [giftId]);

  React.useEffect(() => {
    if (giftId) {
      loadInitialData();
    }
  }, [giftId, loadInitialData]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Carré pour un look plus "e-commerce luxe"
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !wishlistId) return;
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      let finalImageUrl = image;
      if (image && !image.startsWith("http")) {
        const uploadedUrl = await uploadService.uploadImage(image, "gifts");
        if (uploadedUrl) finalImageUrl = uploadedUrl;
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
        isPublished,
      };

      const result = giftId
        ? await giftService.updateGift(giftId, payload)
        : await giftService.addGift(wishlistId!, payload);

      if (result.success) router.back();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER ÉPURÉ */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close-outline" size={28} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {giftId ? "Édition" : "Nouvelle Envie"}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!title.trim() || loading}
          style={styles.saveAction}
        >
          {loading ? (
            <ActivityIndicator size="small" color={THEME.accent} />
          ) : (
            <Text
              style={[styles.saveActionText, !title.trim() && { opacity: 0.3 }]}
            >
              Enregistrer
            </Text>
          )}
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
          {fetching ? (
            <View style={{ height: 300, justifyContent: "center" }}>
              <ActivityIndicator color={THEME.accent} />
            </View>
          ) : (
            <>
              {/* SELECTION IMAGE - STYLE GALERIE */}
              <TouchableOpacity
                style={styles.imageHero}
                onPress={pickImage}
                activeOpacity={0.9}
              >
                {image ? (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: image }}
                      style={styles.mainImage}
                      contentFit="cover"
                    />
                    <View style={styles.imageOverlay} />
                    <View style={styles.editBadge}>
                      <Ionicons name="camera" size={16} color="#FFF" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <View style={styles.iconCircle}>
                      <Ionicons
                        name="add-outline"
                        size={32}
                        color={THEME.accent}
                      />
                    </View>
                    <Text style={styles.placeholderText}>
                      AJOUTER UNE IMAGE
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.formContainer}>
                {/* NOM DU PRODUIT */}
                <View style={styles.inputGroup}>
                  <Text style={styles.miniLabel}>NOM DE L&apos;ARTICLE</Text>
                  <TextInput
                    style={styles.titleInput}
                    placeholder="Qu'est-ce qui vous ferait plaisir ?"
                    placeholderTextColor="#BCBCBC"
                    value={title}
                    onChangeText={setTitle}
                    selectionColor={THEME.accent}
                  />
                </View>

                <View style={styles.row}>
                  {/* PRIX */}
                  <View style={[styles.inputGroup, { flex: 0.45 }]}>
                    <Text style={styles.miniLabel}>PRIX ESTIMÉ</Text>
                    <View style={styles.priceRow}>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="0"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                      />
                      <Text style={styles.currency}>€</Text>
                    </View>
                  </View>

                  {/* PRIORITÉ */}
                  <View style={[styles.inputGroup, { flex: 0.5 }]}>
                    <Text style={styles.miniLabel}>PRIORITÉ</Text>
                    <View style={styles.prioritySelector}>
                      {PRIORITIES.map((p) => (
                        <TouchableOpacity
                          key={p.id}
                          onPress={() => {
                            setPriority(p.id);
                            Haptics.selectionAsync();
                          }}
                          style={[
                            styles.priorityTab,
                            priority === p.id && styles.priorityTabActive,
                          ]}
                        >
                          <Ionicons
                            name={p.icon as any}
                            size={16}
                            color={
                              priority === p.id ? "#FFF" : THEME.textSecondary
                            }
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* LIEN URL */}
                <View style={styles.inputGroup}>
                  <Text style={styles.miniLabel}>LIEN DU PRODUIT</Text>
                  <View style={styles.urlInputWrapper}>
                    <Ionicons
                      name="link-outline"
                      size={18}
                      color={THEME.accent}
                    />
                    <TextInput
                      style={styles.urlInput}
                      placeholder="https://..."
                      placeholderTextColor="#BCBCBC"
                      value={url}
                      onChangeText={setUrl}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* DESCRIPTION */}
                <View style={styles.inputGroup}>
                  <Text style={styles.miniLabel}>NOTES PERSONNELLES</Text>
                  <TextInput
                    style={styles.descriptionInput}
                    placeholder="Taille, couleur, précisions..."
                    placeholderTextColor="#BCBCBC"
                    multiline
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                {/* OPTION PUBLIER (Mettre en avant) */}
                <View
                  style={[
                    styles.ecoCard,
                    {
                      backgroundColor: "#FDF7F2",
                      borderColor: "rgba(175, 144, 98, 0.1)",
                      borderWidth: 1,
                    },
                  ]}
                >
                  <View style={[styles.ecoIconBg, { backgroundColor: "#FFF" }]}>
                    <Ionicons
                      name="megaphone-outline"
                      size={20}
                      color={THEME.accent}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={[styles.ecoTitle, { color: THEME.textMain }]}>
                      Mettre en avant
                    </Text>
                    <Text
                      style={[styles.ecoSub, { color: THEME.textSecondary }]}
                    >
                      Publier dans le fil d&apos;actualité
                    </Text>
                  </View>
                  <Switch
                    value={isPublished}
                    onValueChange={(v) => {
                      setIsPublished(v);
                      if (v)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    trackColor={{ false: "#E9E9EB", true: THEME.accent }}
                    thumbColor="#FFF"
                  />
                </View>

                {/* OPTION ÉCO */}
                <View style={styles.ecoCard}>
                  <View style={styles.ecoIconBg}>
                    <Ionicons name="leaf" size={20} color={THEME.eco} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.ecoTitle}>Seconde main acceptée</Text>
                    <Text style={styles.ecoSub}>
                      Vinted, occasion ou reconditionné
                    </Text>
                  </View>
                  <Switch
                    value={acceptsSecondHand}
                    onValueChange={(v) => {
                      setAcceptsSecondHand(v);
                      if (v)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    trackColor={{ false: "#E9E9EB", true: THEME.eco }}
                    thumbColor="#FFF"
                  />
                </View>
              </View>
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  closeBtn: { width: 44, height: 44, justifyContent: "center" },
  saveAction: { paddingHorizontal: 10 },
  saveActionText: { fontSize: 16, fontWeight: "600", color: THEME.accent },

  scrollContent: { paddingBottom: 40 },

  /* IMAGE HERO */
  imageHero: {
    width: "100%",
    height: 320,
    backgroundColor: "#F2F2F7",
    marginBottom: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: { width: "100%", height: "100%" },
  mainImage: { width: "100%", height: "100%" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  editBadge: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 25,
  },
  imagePlaceholder: { alignItems: "center" },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: THEME.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  placeholderText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
  },

  /* FORM */
  formContainer: { paddingHorizontal: 30 },
  inputGroup: { marginBottom: 35 },
  miniLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 26,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 10,
  },
  priceInput: { fontSize: 22, fontWeight: "500", color: THEME.textMain },
  currency: { fontSize: 18, color: THEME.textSecondary, marginLeft: 5 },

  /* PRIORITY */
  prioritySelector: {
    flexDirection: "row",
    backgroundColor: "#E9E9EB",
    borderRadius: 12,
    padding: 4,
  },
  priorityTab: {
    flex: 1,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  priorityTabActive: {
    backgroundColor: THEME.primary,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  /* URL & DESC */
  urlInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 54,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  urlInput: { flex: 1, marginLeft: 10, fontSize: 15, color: THEME.textMain },
  descriptionInput: {
    fontSize: 16,
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    lineHeight: 24,
    minHeight: 80,
    textAlignVertical: "top",
  },

  /* ECO CARD */
  ecoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4F0",
    padding: 20,
    borderRadius: 24,
    marginTop: 10,
  },
  ecoIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  ecoTitle: { fontSize: 15, fontWeight: "700", color: THEME.textMain },
  ecoSub: { fontSize: 12, color: "#6A826A", marginTop: 2 },
});

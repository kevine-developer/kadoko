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
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { giftService } from "../../../lib/services/gift-service";
import { uploadService } from "../../../lib/services/upload-service";
import { ThemedText } from "@/components/themed-text";
import ThemedIcon from "@/components/themed-icon";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

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
  const theme = useAppTheme();
  const colorScheme = useColorScheme();

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      {/* HEADER ÉPURÉ */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <ThemedIcon name="close-outline" size={28} colorName="textMain" />
        </TouchableOpacity>
        <ThemedText type="default" bold style={styles.headerTitle}>
          {giftId ? "Édition" : "Nouvelle Envie"}
        </ThemedText>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!title.trim() || loading}
          style={styles.saveAction}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.accent} />
          ) : (
            <ThemedText
              type="defaultBold"
              style={[
                styles.saveActionText,
                { color: theme.accent },
                !title.trim() && { opacity: 0.3 },
              ]}
            >
              Enregistrer
            </ThemedText>
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
              <ActivityIndicator color={theme.accent} />
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
                      <ThemedIcon name="camera" size={16} color="#FFF" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: theme.surface },
                      ]}
                    >
                      <ThemedIcon
                        name="add-outline"
                        size={32}
                        colorName="accent"
                      />
                    </View>
                    <ThemedText type="label" colorName="textSecondary">
                      AJOUTER UNE IMAGE
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.formContainer}>
                {/* NOM DU PRODUIT */}
                <View style={styles.inputGroup}>
                  <ThemedText
                    type="label"
                    colorName="textSecondary"
                    style={{ marginBottom: 12 }}
                  >
                    NOM DE L&apos;ARTICLE
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.titleInput,
                      {
                        color: theme.textMain,
                        borderBottomColor: theme.border,
                      },
                    ]}
                    placeholder="Qu'est-ce qui vous ferait plaisir ?"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#666" : "#BCBCBC"
                    }
                    value={title}
                    onChangeText={setTitle}
                    selectionColor={theme.accent}
                  />
                </View>

                <View style={styles.row}>
                  {/* PRIX */}
                  <View style={[styles.inputGroup, { flex: 0.45 }]}>
                    <ThemedText
                      type="label"
                      colorName="textSecondary"
                      style={{ marginBottom: 12 }}
                    >
                      PRIX ESTIMÉ
                    </ThemedText>
                    <View
                      style={[
                        styles.priceRow,
                        { borderBottomColor: theme.border },
                      ]}
                    >
                      <TextInput
                        style={[styles.priceInput, { color: theme.textMain }]}
                        placeholder="0"
                        placeholderTextColor={
                          colorScheme === "dark" ? "#666" : "#BCBCBC"
                        }
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                      />
                      <ThemedText
                        colorName="textSecondary"
                        style={styles.currency}
                      >
                        €
                      </ThemedText>
                    </View>
                  </View>

                  {/* PRIORITÉ */}
                  <View style={[styles.inputGroup, { flex: 0.5 }]}>
                    <ThemedText
                      type="label"
                      colorName="textSecondary"
                      style={{ marginBottom: 12 }}
                    >
                      PRIORITÉ
                    </ThemedText>
                    <View
                      style={[
                        styles.prioritySelector,
                        {
                          backgroundColor:
                            colorScheme === "dark" ? "#2C2C2E" : "#E9E9EB",
                        },
                      ]}
                    >
                      {PRIORITIES.map((p) => (
                        <TouchableOpacity
                          key={p.id}
                          onPress={() => {
                            setPriority(p.id);
                            Haptics.selectionAsync();
                          }}
                          style={[
                            styles.priorityTab,
                            priority === p.id && {
                              backgroundColor: theme.accent,
                              shadowColor: "#000",
                              shadowOpacity: 0.1,
                              shadowRadius: 4,
                            },
                          ]}
                        >
                          <ThemedIcon
                            name={p.icon as any}
                            size={16}
                            color={
                              priority === p.id ? "#FFF" : theme.textSecondary
                            }
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* LIEN URL */}
                <View style={styles.inputGroup}>
                  <ThemedText
                    type="label"
                    colorName="textSecondary"
                    style={{ marginBottom: 12 }}
                  >
                    LIEN DU PRODUIT
                  </ThemedText>
                  <View
                    style={[
                      styles.urlInputWrapper,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <ThemedIcon
                      name="link-outline"
                      size={18}
                      colorName="accent"
                    />
                    <TextInput
                      style={[styles.urlInput, { color: theme.textMain }]}
                      placeholder="https://..."
                      placeholderTextColor={
                        colorScheme === "dark" ? "#666" : "#BCBCBC"
                      }
                      value={url}
                      onChangeText={setUrl}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* DESCRIPTION */}
                <View style={styles.inputGroup}>
                  <ThemedText
                    type="label"
                    colorName="textSecondary"
                    style={{ marginBottom: 12 }}
                  >
                    NOTES PERSONNELLES
                  </ThemedText>
                  <TextInput
                    style={[styles.descriptionInput, { color: theme.textMain }]}
                    placeholder="Taille, couleur, précisions..."
                    placeholderTextColor={
                      colorScheme === "dark" ? "#666" : "#BCBCBC"
                    }
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
                      backgroundColor:
                        colorScheme === "dark" ? "#2C2C2E" : "#FDF7F2",
                      borderColor: theme.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.ecoIconBg,
                      { backgroundColor: theme.surface },
                    ]}
                  >
                    <ThemedIcon
                      name="megaphone-outline"
                      size={20}
                      colorName="accent"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <ThemedText type="defaultBold">Mettre en avant</ThemedText>
                    <ThemedText type="caption" colorName="textSecondary">
                      Publier dans le fil d&apos;actualité
                    </ThemedText>
                  </View>
                  <Switch
                    value={isPublished}
                    onValueChange={(v) => {
                      setIsPublished(v);
                      if (v)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    trackColor={{ false: theme.border, true: theme.accent }}
                    thumbColor="#FFF"
                  />
                </View>

                {/* OPTION ÉCO */}
                <View
                  style={[
                    styles.ecoCard,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#1B2A1B" : "#F0F4F0",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.ecoIconBg,
                      { backgroundColor: theme.surface },
                    ]}
                  >
                    <ThemedIcon name="leaf" size={20} colorName="success" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <ThemedText type="defaultBold">
                      Seconde main acceptée
                    </ThemedText>
                    <ThemedText
                      type="caption"
                      style={{
                        color: colorScheme === "dark" ? "#81C784" : "#6A826A",
                      }}
                    >
                      Vinted, occasion ou reconditionné
                    </ThemedText>
                  </View>
                  <Switch
                    value={acceptsSecondHand}
                    onValueChange={(v) => {
                      setAcceptsSecondHand(v);
                      if (v)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    trackColor={{ false: "#E9E9EB", true: theme.success }}
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
  container: { flex: 1 },

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
  },
  closeBtn: { width: 44, height: 44, justifyContent: "center" },
  saveAction: { paddingHorizontal: 10 },
  saveActionText: { fontSize: 16 },

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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  /* FORM */
  formContainer: { paddingHorizontal: 30 },
  inputGroup: { marginBottom: 35 },
  titleInput: {
    fontSize: 26,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    borderBottomWidth: 1,
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
    paddingBottom: 10,
  },
  priceInput: { fontSize: 22, fontWeight: "500" },
  currency: { fontSize: 18, marginLeft: 5 },

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

  /* URL & DESC */
  urlInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 54,
    borderWidth: 1,
  },
  urlInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  descriptionInput: {
    fontSize: 16,
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
    padding: 20,
    borderRadius: 24,
    marginTop: 10,
  },
  ecoIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});

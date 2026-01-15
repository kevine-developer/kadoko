import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Platform,
  Share,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";

import { Gift } from "@/types/gift";

// --- THEME LUXE ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  accent: "#111827",
  border: "rgba(0,0,0,0.06)",
  danger: "#EF4444",
  success: "#10B981", // Vert Émeraude
  warning: "#D97706", // Ambre
  disabled: "#E5E7EB",
};

interface GiftDetailsBottomSheetProps {
  gift: Gift | null;
  visible: boolean;
  onClose: () => void;
  isOwner?: boolean;
}

export default function GiftDetailsBottomSheet({
  gift,
  visible,
  onClose,
  isOwner = false,
}: GiftDetailsBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%", "92%"], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const handleOpenLink = () => {
    if (gift?.productUrl) {
      Linking.openURL(gift.productUrl).catch(console.error);
    }
  };

  const handleShare = async () => {
    if (!gift) return;
    try {
      const message = `Regarde cette trouvaille : ${gift.title}`;
      await Share.share({ message, title: gift.title, url: gift.productUrl });
    } catch (error) {
      console.error("Erreur partage:", error);
    }
  };

  if (!gift) return null;

  // --- ANALYSE DES ÉTATS ---
  const isReserved =
    gift.status === "RESERVED" ||
    (gift.reservation && !!gift.reservation.userId);
  const isPurchased =
    gift.status === "PURCHASED" || (gift.purchase && !!gift.purchase.userId);
  const isTaken = isReserved || isPurchased;
  const isPublished = gift.publication?.isPublished ?? false;

  // Configuration UX pour le Visiteur (Non-Propriétaire)
  let visitorActionConfig: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    disabled: boolean;
    style: StyleProp<ViewStyle>;
    textStyle: StyleProp<TextStyle>;
  } = {
    label: "Réserver ce cadeau",
    icon: "bag-handle-outline" as keyof typeof Ionicons.glyphMap,
    disabled: false,
    style: styles.primaryButton,
    textStyle: styles.primaryButtonText,
  };

  if (isPurchased) {
    visitorActionConfig = {
      label: "Déjà offert",
      icon: "checkmark-circle",
      disabled: true,
      style: styles.successButtonDisabled,
      textStyle: styles.disabledButtonTextWhite,
    };
  } else if (isReserved) {
    visitorActionConfig = {
      label: "Actuellement réservé",
      icon: "lock-closed",
      disabled: true,
      style: styles.warningButtonDisabled,
      textStyle: styles.disabledButtonTextWhite,
    };
  }

  // Action Principale (Visiteur)
  const handleVisitorAction = () => {
    if (visitorActionConfig.disabled) return;
    console.log("Action: Lancer le flux de réservation");
    // TODO: Navigation vers écran de réservation ou appel API
  };

  // Action Principale (Propriétaire)
  const handleOwnerAction = () => {
    if (!isPublished) {
      console.log("Action: Publier");
    } else {
      handleShare();
    }
  };

  return (
    <GestureHandlerRootView
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
    >
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChange}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={styles.container}>
          {/* --- HEADER IMAGE --- */}
          <View style={styles.imageWrapper}>
            {gift.imageUrl ? (
              <Image
                source={{ uri: gift.imageUrl }}
                style={styles.image}
                contentFit="cover"
                transition={400}
              />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons
                  name="image-outline"
                  size={48}
                  color={THEME.textSecondary}
                />
              </View>
            )}

            {/* OVERLAY SI PRIS (Indication Visuelle Immédiate) */}
            {isTaken && (
              <View style={styles.takenOverlay}>
                <View style={styles.takenBadge}>
                  <Ionicons
                    name={isPurchased ? "gift" : "lock-closed"}
                    size={16}
                    color="#FFF"
                  />
                  <Text style={styles.takenText}>
                    {isPurchased ? "CADEAU OFFERT" : "RÉSERVÉ"}
                  </Text>
                </View>
              </View>
            )}

            {/* BOUTONS FLOTTANTS */}
            <View style={styles.floatingActions}>
              <TouchableOpacity
                style={styles.glassButton}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.glassButton} onPress={onClose}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* --- TITRE & PRIX --- */}
            <View style={styles.headerSection}>
              {/* Badge Propriétaire (État Publication) */}
              {isOwner && (
                <View style={styles.publicationRow}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isPublished
                          ? THEME.success
                          : THEME.textSecondary,
                      },
                    ]}
                  />
                  <Text style={styles.publicationText}>
                    {isPublished ? "EN LIGNE" : "BROUILLON"}
                  </Text>
                </View>
              )}

              <Text style={styles.title}>{gift.title}</Text>

              <View style={styles.metaRow}>
                {gift.estimatedPrice && (
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>
                      {gift.estimatedPrice} €
                    </Text>
                  </View>
                )}

                {/* Badge Statut Textuel */}
                <View
                  style={[styles.statusTag, isTaken && styles.statusTagTaken]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isTaken && { color: THEME.textMain },
                    ]}
                  >
                    {isPurchased
                      ? "Déjà offert"
                      : isReserved
                      ? "Réservé"
                      : "Disponible"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* --- LIEN PRODUIT --- */}
            {gift.productUrl && (
              <TouchableOpacity
                style={styles.linkCard}
                onPress={handleOpenLink}
                activeOpacity={0.8}
              >
                <View style={styles.linkIconBox}>
                  <Ionicons name="globe-outline" size={24} color="#111827" />
                </View>
                <View style={styles.linkInfo}>
                  <Text style={styles.linkLabel}>Boutique en ligne</Text>
                  <Text style={styles.linkUrl} numberOfLines={1}>
                    {new URL(gift.productUrl).hostname.replace("www.", "")}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}

            {/* --- DESCRIPTION --- */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>À propos</Text>
              <Text style={styles.description}>
                {gift.description ||
                  "Aucune description fournie pour cet objet."}
              </Text>
            </View>

            {/* --- FOOTER ACTIONS (Logique UX) --- */}
            <View style={styles.footerActions}>
              {/* BOUTON SECONDAIRE (Toujours visible si possible) */}
              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.7}
                onPress={() =>
                  isOwner ? console.log("Edit") : console.log("Save/Ignore")
                }
                disabled={isOwner && isPurchased} // Owner ne peut pas modifier si acheté
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    isOwner && isPurchased && { color: THEME.textSecondary },
                  ]}
                >
                  {isOwner ? "Modifier" : "Sauvegarder"}
                </Text>
              </TouchableOpacity>

              {/* BOUTON PRINCIPAL (Contextuel) */}
              {isOwner ? (
                // PROPRIÉTAIRE : Publier ou Partager
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    isPublished ? styles.publishedBtn : styles.draftBtn,
                  ]}
                  onPress={handleOwnerAction}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.primaryButtonText,
                      isPublished && { color: THEME.textMain },
                    ]}
                  >
                    {isPublished ? "Partager" : "Publier"}
                  </Text>
                  <Ionicons
                    name={isPublished ? "share-social" : "cloud-upload"}
                    size={20}
                    color={isPublished ? THEME.textMain : "#FFF"}
                  />
                </TouchableOpacity>
              ) : (
                // VISITEUR : Réserver ou Statut Indisponible
                <TouchableOpacity
                  style={[visitorActionConfig.style, { flex: 2 }]}
                  onPress={handleVisitorAction}
                  activeOpacity={visitorActionConfig.disabled ? 1 : 0.8}
                  disabled={visitorActionConfig.disabled}
                >
                  <Text style={visitorActionConfig.textStyle}>
                    {visitorActionConfig.label}
                  </Text>
                  {!visitorActionConfig.disabled && (
                    <Ionicons
                      name={visitorActionConfig.icon}
                      size={20}
                      color="#FFF"
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: THEME.background,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    backgroundColor: "#D1D5DB",
    width: 48,
    height: 5,
    borderRadius: 3,
    marginTop: 8,
  },
  container: {
    flex: 1,
    overflow: "hidden",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  /* HEADER IMAGE */
  imageWrapper: {
    height: 280,
    width: "100%",
    position: "relative",
    backgroundColor: "#F3F4F6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
  },

  /* OVERLAYS & BADGES VISUELS */
  takenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)", // Assombrit l'image
    alignItems: "center",
    justifyContent: "center",
  },
  takenBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.25)", // Glass effect
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(10px)",
  },
  takenText: {
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: 1,
    fontSize: 14,
  },

  /* ACTIONS FLOTTANTES */
  floatingActions: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    gap: 10,
  },
  glassButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  /* CONTENT */
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  headerSection: {
    marginBottom: 20,
  },
  publicationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  publicationText: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.textSecondary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  statusTagTaken: {
    backgroundColor: "#FFF7ED", // Ambre très clair
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.textSecondary,
  },

  divider: {
    height: 1,
    backgroundColor: THEME.border,
    marginBottom: 24,
  },

  /* LINKS & DETAILS */
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  linkIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  linkInfo: { flex: 1, gap: 2 },
  linkLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  linkUrl: { fontSize: 16, color: THEME.textMain, fontWeight: "600" },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 26,
    fontWeight: "400",
  },

  /* FOOTER & BUTTONS */
  footerActions: {
    flexDirection: "row",
    gap: 16,
  },
  secondaryButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  // Style Bouton Principal (Noir / Défaut)
  primaryButton: {
    flex: 2,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111827",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Styles Boutons Désactivés (UX Feedback)
  successButtonDisabled: {
    flex: 2,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.success, // Vert
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    opacity: 0.9,
  },
  warningButtonDisabled: {
    flex: 2,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.warning, // Ambre
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    opacity: 0.9,
  },
  disabledButtonTextWhite: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  // Owner styles
  draftBtn: { backgroundColor: "#111827" },
  publishedBtn: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowOpacity: 0,
  },
});

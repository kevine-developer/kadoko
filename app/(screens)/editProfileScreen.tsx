import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { authClient } from "@/lib/auth/auth-client";
import { userService } from "@/lib/services/user-service";
import { uploadService } from "@/lib/services/upload-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { FormError } from "@/components/auth/FormError";

const SECTION_SPACING = 24;

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user as any;

  // Local state for form fields
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [description, setDescription] = useState(user?.description || "");
  const [coverUrl, setCoverUrl] = useState(user?.coverUrl || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.image || "");

  // Social links state
  const [socialLinks, setSocialLinks] = useState<any>(
    (user as any)?.socialLinks || {},
  );

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ name?: string; username?: string }>(
    {},
  );

  // Helper to mark changes
  const handleChange = (setter: any, value: any) => {
    setter(value);
    setHasChanges(true);
  };

  const handleSocialChange = (key: string, value: string) => {
    setSocialLinks((prev: any) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const pickImage = async (type: "avatar" | "cover") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: type === "avatar" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setIsLoading(true);
      try {
        const folder = type === "avatar" ? "profiles" : "covers";
        const uploadedUrl = await uploadService.uploadImage(
          result.assets[0].uri,
          folder,
        );

        if (uploadedUrl) {
          if (type === "avatar") {
            setAvatarUrl(uploadedUrl);
          } else {
            setCoverUrl(uploadedUrl);
          }
          setHasChanges(true); // Don't save immediately, let user save all at once or decided if we want auto-save for images?
          // Strategy: For images, usually better to update state and let user "Save" globally,
          // BUT upload is already done. We'll include the new URL in the final save payload.
        }
      } catch {
        showErrorToast("Erreur lors de l'upload de l'image");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsLoading(true);
    setServerError(null);

    try {
      // Validate username if changed
      if (username !== user?.username) {
        // Simple regex check or let server handle
        const sanitized = username.replace("@", "").toLowerCase();
        if (sanitized.length < 3) {
          setErrors({
            ...errors,
            username: "Le nom d'utilisateur est trop court",
          });
          setIsLoading(false);
          return;
        }
        // Update local sanitized before sending
        setUsername(sanitized);
      }

      const payload = {
        name,
        username: username.replace("@", "").toLowerCase(),
        description,
        image: avatarUrl,
        coverUrl,
        socialLinks,
      };

      const res = await userService.updateProfile(payload);

      if (res.success) {
        showSuccessToast("Profil mis à jour");
        await refetch();
        router.back();
      } else {
        setServerError(res.message || "Erreur lors de la mise à jour");
      }
    } catch {
      setServerError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges || isLoading}
          style={[
            styles.saveBtn,
            (!hasChanges || isLoading) && styles.saveBtnDisabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Enregistrer</Text>
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
          {/* Images Section */}
          <View style={styles.imagesSection}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => pickImage("cover")}
              style={styles.coverWrapper}
            >
              {coverUrl ? (
                <Image source={{ uri: coverUrl }} style={styles.coverImage} />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Ionicons name="camera-outline" size={32} color="#6B7280" />
                  <Text style={styles.placeholderText}>
                    Ajouter une couverture
                  </Text>
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Ionicons name="pencil" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => pickImage("avatar")}
              style={styles.avatarWrapper}
            >
              <Image
                source={{
                  uri:
                    avatarUrl ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
                }}
                style={styles.avatarImage}
              />
              <View style={styles.editIconContainer}>
                <Ionicons name="pencil" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Basic Info Section */}
          <View style={styles.formSection}>
            <FormError message={serverError} />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(t) => {
                  handleChange(setName, t);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="Votre nom"
                placeholderTextColor="#9CA3AF"
              />
              {errors.name && (
                <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                  {errors.name}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom d&apos;utilisateur</Text>
              <View style={styles.usernameInputWrapper}>
                <Text style={styles.usernamePrefix}>@</Text>
                <TextInput
                  style={[styles.input, styles.messageInputNoBorder]}
                  value={username.replace("@", "")}
                  onChangeText={(t) => {
                    handleChange(setUsername, t);
                    if (errors.username)
                      setErrors({ ...errors, username: undefined });
                  }}
                  placeholder="username"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                />
              </View>
              {errors.username && (
                <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                  {errors.username}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={(t) => handleChange(setDescription, t)}
                placeholder="Parlez-nous de vous..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={160}
              />
              <Text style={styles.charCount}>{description.length}/160</Text>
            </View>
          </View>

          {/* Social Links Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Réseaux Sociaux</Text>

            <SocialInput
              icon="logo-instagram"
              color="#E1306C"
              value={socialLinks.instagram || ""}
              onChange={(t) => handleSocialChange("instagram", t)}
              placeholder="Instagram username"
            />
            <SocialInput
              icon="logo-facebook"
              color="#1877F2"
              value={socialLinks.facebook || ""}
              onChange={(t) => handleSocialChange("facebook", t)}
              placeholder="Facebook username/link"
            />
            <SocialInput
              icon="logo-twitter"
              color="#000000"
              value={socialLinks.twitter || ""}
              onChange={(t) => handleSocialChange("twitter", t)}
              placeholder="X username"
            />
            <SocialInput
              icon="logo-tiktok"
              color="#000000"
              value={socialLinks.tiktok || ""}
              onChange={(t) => handleSocialChange("tiktok", t)}
              placeholder="TikTok username"
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Micro-component for consistent social inputs
interface SocialInputProps {
  icon: any;
  color: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
}

const SocialInput = ({
  icon,
  color,
  value,
  onChange,
  placeholder,
}: SocialInputProps) => (
  <View style={styles.socialInputRow}>
    <View style={styles.socialIconWrapper}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <TextInput
      style={styles.socialInput}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      autoCapitalize="none"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  closeBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  saveBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Images
  imagesSection: {
    marginBottom: SECTION_SPACING,
  },
  coverWrapper: {
    height: 150,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  coverPlaceholder: {
    alignItems: "center",
    gap: 8,
  },
  placeholderText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "500",
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    position: "absolute",
    bottom: -50,
    left: 20,
    backgroundColor: "#F3F4F6",
    zIndex: 10,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 12,
  },

  // Form
  formSection: {
    paddingHorizontal: 20,
    marginTop: 60, // Space for avatar overlap
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  messageInputNoBorder: {
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    flex: 1,
  },
  usernameInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  usernamePrefix: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "500",
    marginRight: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#9CA3AF",
  },

  // Social
  socialInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  socialIconWrapper: {
    width: 32,
    alignItems: "center",
    marginRight: 8,
  },
  socialInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
});

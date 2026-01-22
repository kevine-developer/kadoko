import * as FileSystem from "expo-file-system/legacy";
import { authClient } from "@/features/auth";
import { getApiUrl } from "../api-config";

export const uploadService = {
  /**
   * Upload une image vers Cloudinary via notre serveur
   * @param uri URI locale de l'image (obtenue via ImagePicker)
   * @param folder Dossier Cloudinary cible (ex: 'gifts', 'profiles')
   */
  uploadImage: async (
    uri: string,
    folder: string = "kadoko",
  ): Promise<string | null> => {
    try {
      // Conversion de l'image en base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      const imageData = `data:image/jpeg;base64,${base64}`;

      const response = await authClient.$fetch(getApiUrl("/upload"), {
        method: "POST",
        body: {
          image: imageData,
          folder: folder,
        },
      });

      const result = response.data as any;

      if (result && result.success) {
        return result.imageUrl;
      }

      console.error("Upload failed:", result?.message || "Unknown error");
      return null;
    } catch (error) {
      console.error("Error in uploadService.uploadImage:", error);
      return null;
    }
  },
};

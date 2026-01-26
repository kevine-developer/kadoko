import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/features/auth/services/auth-client";
import { getApiUrl } from "@/lib/api-config";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>(null!);
  const responseListener = useRef<Notifications.Subscription>(null!);
  const router = useRouter();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        saveTokenToServer(token);
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification cliquée:", response);
        const targetUrl = response.notification.request.content.data?.targetUrl;

        if (targetUrl) {
          // Utiliser un petit délai pour être sûr que l'app est prête
          setTimeout(() => {
            router.push(targetUrl as any);
          }, 100);
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router]);

  const saveTokenToServer = async (token: string) => {
    try {
      const session = await authClient.getSession();
      if (!session.data?.user) return;

      await authClient.$fetch(getApiUrl("/users/me/push-token"), {
        method: "POST",
        body: { pushToken: token },
      });
      console.log("Push token enregistré sur le serveur");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du token push:", error);
    }
  };

  return { expoPushToken, notification };
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Échec de l'obtention des permissions pour le push");
      return;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId:
          Constants.expoConfig?.extra?.eas?.projectId ??
          "0f39ce88-4b44-4b3a-9b0e-a63738d0172f",
      })
    ).data;
  } else {
    console.log("Les notifications push nécessitent un appareil physique");
  }

  return token;
}

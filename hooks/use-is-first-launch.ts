import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

const KEY_IS_FIRST_LAUNCH = "isFirstLaunch";

export function useIsFirstLaunch() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const value = await SecureStore.getItemAsync(KEY_IS_FIRST_LAUNCH);
        if (value === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error("Error checking first launch:", error);
        // Default to false in case of error to avoid stuck onboarding
        setIsFirstLaunch(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkFirstLaunch();
  }, []);

  const setHasLaunched = async () => {
    try {
      await SecureStore.setItemAsync(KEY_IS_FIRST_LAUNCH, "false");
      setIsFirstLaunch(false);
    } catch (error) {
      console.error("Error setting first launch:", error);
    }
  };

  return { isFirstLaunch, isLoading, setHasLaunched };
}

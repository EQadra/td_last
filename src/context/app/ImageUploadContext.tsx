// context/app/ImageUploadContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
} from "react";

import * as ImagePicker from "expo-image-picker";
import api from "../../utils/axios";

type Role =
  | "doctor"
  | "lawyer"
  | "association"
  | "shop";

interface UploadParams {
  role: Role;
  image: string;
}

interface ImageUploadContextType {
  pickImage: () => Promise<string | null>;
  uploadImageByRole: (
    params: UploadParams
  ) => Promise<any>;
}

const ImageUploadContext =
  createContext<ImageUploadContextType>(
    {} as ImageUploadContextType
  );

export const ImageUploadProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const pickImage = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (result.canceled) return null;

    return result.assets[0].uri;
  };

  const uploadImageByRole = async ({
    role,
    image,
  }: UploadParams) => {
    try {
      const formData = new FormData();

      const filename =
        image.split("/").pop() ||
        `image-${Date.now()}.jpg`;

      const ext =
        filename
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const mimeType =
        ext === "png"
          ? "image/png"
          : ext === "webp"
          ? "image/webp"
          : "image/jpeg";

      formData.append("image", {
        uri: image,
        name: filename,
        type: mimeType,
      } as any);

      // ✅ ENDPOINTS CORREGIDOS
      const endpoints = {
        doctor: "/doctors/update-image",    // ✅ CORREGIDO
        lawyer: "/lawyer/image",            // ✅ BIEN
        association: "/association/image",  // ✅ BIEN
        shop: "/shop/image",                // ✅ BIEN
      };

      console.log("📤 SUBIENDO IMAGEN:");
      console.log({
        role,
        uri: image,
        name: filename,
        type: mimeType,
        endpoint: endpoints[role],
      });

      const response = await api.post(
        endpoints[role],
        formData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type":
              "multipart/form-data",
          },
          // ✅ NO uses transformRequest con FormData
        }
      );

      console.log("✅ IMAGEN SUBIDA:", response.data);

      return response.data;
    } catch (error: any) {
      console.log(
        "❌ UPLOAD ERROR",
        error?.response?.data || error
      );

      return null;
    }
  };

  return (
    <ImageUploadContext.Provider
      value={{
        pickImage,
        uploadImageByRole,
      }}
    >
      {children}
    </ImageUploadContext.Provider>
  );
};

export const useImageUpload = () =>
  useContext(ImageUploadContext);
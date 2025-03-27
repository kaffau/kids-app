import { Platform, Alert } from "react-native";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { BASE_URL } from "../../utils/api";

export const useImage = () => {
    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [error, setError] = useState("");

    const requestPermissions = async () => {
        if (Platform.OS !== "web") {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission required",
                    "We need access to your photos to upload images"
                );
            }
        }
    };

    useEffect(() => {
        requestPermissions();
    }, []);

    const pickImages = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                allowsMultipleSelection: true,
            });
            if (!result.canceled) {
                setImages(result.assets);
                saveImageLocally(result.assets);
            }
        } catch (error) {
            setError(error as string);
            console.error(error);
        }
    };

    const saveImageLocally = async (images: ImagePicker.ImagePickerAsset[]) => {
        try {
            // TODO refactor this by storing all images by calling storing function once and passing images array
            images.map(async (item: ImagePicker.ImagePickerAsset) => {
                const fileName = item.uri.split("/").pop()!;
                const fileUri = FileSystem.documentDirectory + fileName;
                await FileSystem.copyAsync({
                    from: item.uri,
                    to: fileUri,
                });
            });
        } catch (error) {
            setError(error as string);
            console.error("Error saving image:", error);
        }
    };

    const uploadImages = async (images: ImagePicker.ImagePickerAsset[]) => {
        if (isUploading) {
            return;
        }
        setIsUploading(true);
        try {
            /* TODO create separate hook for fetching and use Promise.allSettled */
            images.map(async (item: ImagePicker.ImagePickerAsset) => {
                const fileUri =
                    FileSystem.documentDirectory + item.uri.split("/").pop()!;
                const file = await FileSystem.readAsStringAsync(fileUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                const response = await fetch(BASE_URL, {
                    headers: {
                        Authorization: process.env
                            .EXPO_PUBLIC_API_URL as string,
                    },
                    method: "POST",
                    body: JSON.stringify({
                        filename: item.fileName,
                        filetype: item.mimeType,
                    }),
                });

                if (response.status === 200) {
                    const data = await response.text();
                    await fetch(data, {
                        headers: {
                            "Content-Type": item.mimeType as string,
                        },
                        method: "PUT",
                        body: file,
                    });
                }
            });
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUploadWhenOnline = async () => {
        if (images.length) {
            await uploadImages(images);
        }
    };
    return {
        error,
        requestPermissions,
        pickImages,
        saveImageLocally,
        handleUploadWhenOnline,
        images,
        isUploading,
    };
};

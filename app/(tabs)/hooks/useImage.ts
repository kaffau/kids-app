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
                setImages((prev) => [...prev, ...result.assets]);
                result.assets.forEach((item) => saveImageLocally(item));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const saveImageLocally = async (image: ImagePicker.ImagePickerAsset) => {
        try {
            /* TODO: make sure to use uniq name for file */
            const fileName = image.uri.split("/").pop()!;
            const fileUri = FileSystem.documentDirectory + fileName;
            await FileSystem.copyAsync({
                from: image.uri,
                to: fileUri,
            });
        } catch (error) {
            console.error("Error saving image:", error);
        }
    };

    const fetchUploadUrl = async (image: ImagePicker.ImagePickerAsset) => {
        const response = await fetch(BASE_URL, {
            headers: {
                Authorization: process.env.KEY as string,
            },
            method: "POST",
            body: JSON.stringify({
                filename: image.fileName,
                filetype: image.mimeType,
            }),
        });
        return response;
    };

    const uploadImageToServer = async (
        url: string,
        mimeType: string,
        file: string
    ) => {
        const response = await fetch(url, {
            headers: {
                "Content-Type": mimeType,
            },
            method: "PUT",
            body: file,
        });
        if (!response.ok) {
            setError("Error occured while saving image");
        }
    };

    const uploadImages = async (images: ImagePicker.ImagePickerAsset[]) => {
        if (isUploading) {
            return;
        }
        setIsUploading(true);
        try {
            /* TODO: create separate hook for fetching and use Promise.allSettled */
            images.forEach(async (item: ImagePicker.ImagePickerAsset) => {
                const fileUri =
                    FileSystem.documentDirectory + item.uri.split("/").pop()!;
                const file = await FileSystem.readAsStringAsync(fileUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                const response = await fetchUploadUrl(item);
                if (response.ok) {
                    const url = await response.text();
                    uploadImageToServer(url, item.mimeType as string, file);
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

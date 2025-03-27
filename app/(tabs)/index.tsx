import { Image, Button, View, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useImage } from "./hooks/useImage";
import React from "react";

const HomeScreen = () => {
  const { images, error, pickImages, isUploading, handleUploadWhenOnline } = useImage();
    return (
        <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <Text style={{ marginBottom: 20 }}>Offline Image Upload App</Text>
            {images.map(
                (image: ImagePicker.ImagePickerAsset, index: number) => {
                    return (
                        <Image
                            key={index}
                            source={{ uri: image.uri }}
                            style={{
                                width: 200,
                                height: 200,
                                marginBottom: 20,
                            }}
                        />
                    );
                }
            )}
            {error && <Text>{error}</Text>}
            <Button title="Pick Image" onPress={pickImages} />
            <Button
                title={isUploading ? "Uploading..." : "Upload Image"}
                onPress={handleUploadWhenOnline}
                disabled={isUploading}
            />
        </View>
    );
};

export default HomeScreen;

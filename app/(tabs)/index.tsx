import { Image, Button, View, Text, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useImage } from "./hooks/useImage";
import React from "react";

const HomeScreen = () => {
    const { images, error, pickImages, isUploading, handleUploadWhenOnline } =
        useImage();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Offline Image Upload App</Text>
            {images?.map(
                (image: ImagePicker.ImagePickerAsset, index: number) => {
                    return (
                        <Image
                            key={index}
                            source={{ uri: image.uri }}
                            style={styles.image}
                        />
                    );
                }
            )}
            {error && <Text>{error}</Text>}
            {/* TODO: Show loading state for all images, implement retry mechanism */}
            <Button title="Pick Image" onPress={pickImages} />
            <Button
                title={isUploading ? "Uploading..." : "Upload Image"}
                onPress={handleUploadWhenOnline}
                disabled={isUploading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
      marginBottom: 20
    },
    image: {
      width: 200,
      height: 200,
      marginBottom: 20,
    }
});

export default HomeScreen;

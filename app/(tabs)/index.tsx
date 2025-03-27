import {
    Image,
    Button,
    StatusBar,
    Text,
    StyleSheet,
    ScrollView,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useImage } from "./hooks/useImage";
import React from "react";

const HomeScreen = () => {
    const { images, error, pickImages, isUploading, handleUploadWhenOnline } =
        useImage();
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container} edges={["top"]}>
                <ScrollView>
                    <Text style={styles.title}>Offline Image Upload App</Text>
                    {error && <Text>{error}</Text>}
                    {/* TODO: Show loading state for all images, implement retry mechanism */}
                    <Button title="Pick Image" onPress={pickImages} />
                    <Button
                        title={isUploading ? "Uploading..." : "Upload Image"}
                        onPress={handleUploadWhenOnline}
                        disabled={isUploading}
                    />
                    {/* TODO: Use FlatList for better performance */}
                    {images.map((item, index) => (
                        <Image
                            key={index}
                            source={{ uri: item.uri }}
                            style={styles.image}
                        />
                    ))}
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        marginBottom: 20,
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 1,
        resizeMode: "contain",
    },
});

export default HomeScreen;

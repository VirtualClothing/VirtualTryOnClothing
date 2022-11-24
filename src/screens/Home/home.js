//COMPONENTS
import {
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Image,
  FlatList,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { GradientStyle, FullScreenLoader } from "@components";
import * as ImagePicker from "expo-image-picker";

//UTILITIES
import { BaseColor, storage } from "@config";

//CONSTANTS
import { HOME_ITEMS, MESSAGES } from "@constants/constants";

//STYLES
import styles from "./home_styles";
const { parentContainer } = styles;

// REDUX ELEMENTS FOR LOCAL DATA STORAGE
import { useSelector } from "react-redux";

// FIREBASE UTILITIES
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Home = ({ navigation }) => {
  const userData = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const clickEventListener = (item) => {
    switch (item.name) {
      case "Store Products":
        navigation.navigate("Products");
        break;
      case "Upload Video":
        showInstructions();
        // navigation.navigate("ThreeDAvatar");
        break;
      case "Shopping Cart":
        navigation.navigate("Cart");
        break;
      default:
        break;
    }
  };

  const showInstructions = () => {
    Alert.alert(
      "Instructions",
      MESSAGES.VIDEO_INSTRUCTION,
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Proceed",
          onPress: () => pickVideo(),
          style: "cancel",
        },
      ]
    );
  };

  // this is native function for picking image from local mobile gallery
  const pickVideo = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      if (result.duration > 30000) {
        Alert.alert("Error", MESSAGES.VIDEO_LIMIT_ERROR);
        return;
      } else {
        const video = result.uri;
        await uploadImage(video);
      }
    }
  };

  // this function will take image file as a parameter and update that file in firebase storage
  const uploadImage = async (file) => {
    let response = await fetch(file);
    let blob = await response.blob();
    const storageRef = ref(storage, `videos/${userData?.userId}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);
    setIsLoading(true);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // setUploadProgress(Math.round(progress) || 0);
        switch (snapshot.state) {
          case "paused":
            // console.log("Upload is paused");
            break;
          case "running":
            // console.log("Upload is running");
            break;
        }
      },
      (error) => {
        setIsLoading(false);
        setUploadProgress(0);
        alert(MESSAGES.VIDEO_UPLOAD_FAIL_ERROR);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const videoUrl = downloadURL;
          navigation.navigate("ThreeDAvatar", { videoUrl });
          setIsLoading(false);
          setUploadProgress(0);
        });
      }
    );
  };

  // this is the GUI view of the screen
  return (
    <>
      <GradientStyle style={parentContainer}>
        <SafeAreaView style={{ flex: 1 }}>
          <FullScreenLoader
            show={isLoading}
            text={"Loading"}
            setShow={() => {}}
            progress={uploadProgress}
            uploading={true}
            // showProgress={true}
          />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginLeft: 20,
              marginVertical: 15,
              color: BaseColor.darkPrimaryColor,
            }}
          >
            Welcome : {userData?.username || "Loading..."}
          </Text>
          <View style={styles.container}>
            <FlatList
              style={styles.contentList}
              data={HOME_ITEMS}
              keyExtractor={(item) => {
                return item.id;
              }}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => {
                      clickEventListener(item);
                    }}
                  >
                    <Image style={styles.image} source={{ uri: item?.image }} />
                    <View style={styles.cardContent}>
                      <Text style={styles.name}>{item.name}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </SafeAreaView>
      </GradientStyle>
    </>
  );
};

export default Home;

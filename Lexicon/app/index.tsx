import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width: screenWidth } = Dimensions.get('window');

interface WordData {
  word: string;
  phonetic: string;
  meanings: DictionaryApiMeaning[];
  date: string;
}

interface DictionaryApiMeaning {
  partOfSpeech: string;
  definitions: {
    definition: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
  }[];
}

interface DictionaryApiResponse {
  word: string;
  phonetic: string;
  meanings: DictionaryApiMeaning[];
}

export default function Index() {
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [meaningIndex, setMeaningIndex] = useState(0);
  const [definitionIndex, setDefinitionIndex] = useState(0);

  //Animation values
  const definitionTranslateX = useRef(new Animated.Value(0)).current;
  const meaningTranslateY = useRef(new Animated.Value(0)).current;
  const definitionOpacity = useRef(new Animated.Value(1)).current;
  const meaningOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadWordOfTheDay();
  }, []);

  const loadWordOfTheDay = async () => {
    console.log("Loading word of the day...");
    const today = new Date().toISOString().split("T")[0];
    try {
      // Check if we already have today's word
      const storedData = await AsyncStorage.getItem("wordOfTheDay");
      if (storedData) {
        const parsed: WordData = JSON.parse(storedData);
        if (parsed.date === today) {
          setWordData(parsed);
          setLoading(false);
          return;
        }
      }

      let attempts = 0;
      let found = false;
      let word = "";
      let phonetic = "";
      let meanings: DictionaryApiMeaning[] = [];
      let definition = "";

      while (!found && attempts < 10) {
        attempts++;
        console.log(`Attempt ${attempts} to fetch word of the day...`);
        // Step 1: Get a random word
        const wordRes = await axios.get<string[]>(
          "https://random-word-api.herokuapp.com/word"
        );
        word = wordRes.data[0];
        console.log(`Attempt ${attempts}: Fetched word - ${word}`);

        try {
          const defRes = await axios.get<DictionaryApiResponse[]>(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );
          phonetic = defRes.data[0]?.phonetic || "";
          meanings = defRes.data[0]?.meanings || [];
          definition =
            defRes.data[0]?.meanings[0]?.definitions[0]?.definition ||
            "No definition found.";
          found = true;
        } catch (err) {
          // If the word doesn't exist, try again
          console.error(
            `Attempt ${attempts}: Failed to fetch definition for ${word}`,
            err
          );
          continue;
        }
      }

      if (found) {
        const newWordData: WordData = { word, phonetic, meanings, date: today };
        console.log(`Successfully fetched word: ${word}`);
        await AsyncStorage.setItem("wordOfTheDay", JSON.stringify(newWordData));
        setWordData(newWordData);
      } else {
        // Fallback if no word found after max attempts
        setWordData({
          word: "Tuff",
          phonetic: "/'tʌf",
          meanings: [
            {
              partOfSpeech: "noun",
              definitions: [
                {
                  definition:
                    "To express compassion following an unfortunate event, e.g. the word of the day cannot be fetched.",
                },
              ],
            },
          ],
          date: today,
        });
      }
    } catch (error) {
      console.error("Error fetching word:", error);
      setWordData(null);
    } finally {
      setLoading(false);
    }
  };

  const animateDefinitionChange = (direction: "left" | "right") => {
    const startX = direction === "left" ? screenWidth : -screenWidth;

    if (!wordData?.meanings?.[meaningIndex]?.definitions) {
      console.warn("Invalid word data, cannot animate definition change");
      return;
    }

    Animated.parallel([
      Animated.timing(definitionTranslateX, {
        toValue: direction === "left" ? -screenWidth : screenWidth,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(definitionOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update the definition index
      setDefinitionIndex((prev) => {
        const currentMeaning = wordData?.meanings[meaningIndex];
        if (!currentMeaning) return prev;
        
        if (direction === 'left') {
          return prev < currentMeaning.definitions.length - 1 ? prev + 1 : prev;
        } else {
          return prev > 0 ? prev - 1 : prev;
        }
      });
      
      // Reset position for slide in
      definitionTranslateX.setValue(startX);
      
      // Slide in new definition
      Animated.parallel([
        Animated.timing(definitionTranslateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(definitionOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    });
  }

  const animateMeaningChange = (direction: "up" | "down") => {
    const startY = direction === "up" ? 50 : -50;

    if (!wordData?.meanings?.[meaningIndex]) {
      console.warn("Invalid word data, cannot animate definition change");
      return;
    }

    Animated.parallel([
      Animated.timing(meaningTranslateY, {
        toValue: direction === "up" ? -50 : 50,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(meaningOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update the meaning index
      setMeaningIndex((prev) => {
        if (!wordData) return prev;

        const newIndex =
          direction === "up"
            ? prev < wordData.meanings.length - 1
              ? prev + 1
              : prev
            : prev > 0
            ? prev - 1
            : prev;

        if (newIndex !== prev) {
          setDefinitionIndex(0); // Reset definition index when meaning changes
        }
        return newIndex;
      });

      // Reset position for slide in
      meaningTranslateY.setValue(startY);

      // Slide in new meaning
      Animated.parallel([
        Animated.timing(meaningTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(meaningOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  

  const swipeGesture = Gesture.Pan().onEnd((event) => {
    if (!wordData) return;

    if (Math.abs(event.translationY) > Math.abs(event.translationX)) {
      if (event.translationY < 0) {
        // Swipe up
        console.log("Swiped up");
        animateMeaningChange("up");
      } else {
        // Swipe down
        console.log("Swiped down");
        animateMeaningChange("down");
      }
    } else {
      if (event.translationX < 0) {
        // Swipe left
        console.log("Swiped left");
        animateDefinitionChange("left");
      } else {
        // Swipe right
        console.log("Swiped right");
        animateDefinitionChange("right");
      }
    }
  }).runOnJS(true);

  if (loading) {
    return (
      console.log("Loading..."),
      (
        <View style={styles.container}>
          <ActivityIndicator size="large" />
        </View>
      )
    );
  }

  if (!wordData) {
    console.error("No word data available, using fallback.");
    const fallbackWordData: WordData = {
      word: "Tuff",
      phonetic: "/'tʌf",
      meanings: [
        {
          partOfSpeech: "noun",
          definitions: [
            {
              definition:
                "To express compassion following an unfortunate event, e.g. the word of the day cannot be fetched.",
            },
          ],
        },
      ],
      date: new Date().toISOString().split("T")[0],
    };

    return (
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.container}>
          <Text style={styles.word}>{fallbackWordData.word}</Text>
          {fallbackWordData.phonetic && (
            <Text style={styles.phonetic}>{fallbackWordData.phonetic}</Text>
          )}
          <Text style={styles.meaning}>
            {fallbackWordData.meanings[0]?.partOfSpeech || "Unknown"}
          </Text>
          <Text style={styles.definition}>
            {fallbackWordData.meanings[0]?.definitions[0]?.definition ||
              "No definition available."}
          </Text>
          <Button
            title="Reset Storage"
            onPress={() => {
              AsyncStorage.clear();
              setWordData(null);
              setMeaningIndex(0);
              setDefinitionIndex(0);
              setLoading(true);
              loadWordOfTheDay();
            }}
          />
        </View>
      </GestureDetector>
    );
  }

  return (
    console.log("Rendering word of the day..."),
    (
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.container}>
          <Text style={styles.word}>{wordData.word}</Text>
          {wordData.phonetic && (
            <Text style={styles.phonetic}>{wordData.phonetic}</Text>
          )}
          <Animated.View
            style={[
              styles.meaningContainer,
              {
                transform: [{ translateY: meaningTranslateY }],
                opacity: meaningOpacity,
              },
            ]}
          >
            <Text style={styles.meaning}>
              {wordData.meanings[meaningIndex]?.partOfSpeech || "Unknown"}
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.definitionContainer,
              {
                transform: [{ translateX: definitionTranslateX }],
                opacity: definitionOpacity,
              },
            ]}
          >
            <Text style={styles.definition}>
              {wordData.meanings[meaningIndex]?.definitions[definitionIndex]
                ?.definition || "No definition available."}
            </Text>
          </Animated.View>
          <Button
            title="Reset Storage"
            onPress={() => {
              AsyncStorage.clear();
              setWordData(null);
              setMeaningIndex(0);
              setDefinitionIndex(0);
              setLoading(true);
              loadWordOfTheDay();
            }}
          />
        </View>
      </GestureDetector>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  word: { fontSize: 32, fontWeight: "bold", marginBottom: 7 },
  phonetic: {
    fontSize: 18,
    fontStyle: "italic",
    marginBottom: 10,
    opacity: 0.7,
  },
  meaning: { fontSize: 18, marginLeft: 10, color: "#888" },
  definition: { fontSize: 18, textAlign: "center" },
  meaningContainer: {
    marginBottom: 10,
  },
  definitionContainer: {
    paddingHorizontal: 20,
    minHeight: 100,
    justifyContent: "center",
  },
});

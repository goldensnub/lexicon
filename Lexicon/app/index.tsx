import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

interface WordData {
  word: string;
  phonetic: string
  definition: string;
  date: string;
}

export default function Index() {
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWordOfTheDay();
  }, []);

  const loadWordOfTheDay = async () => {
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
      

      // Step 1: Get a random word
      const wordRes = await axios.get<string[]>(
        "https://random-word-api.herokuapp.com/word"
      );
      const word = wordRes.data[0];
      console.log("Fetched word:", word);

      // Step 2: Get its definition
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


      const defRes = await axios.get<DictionaryApiResponse[]>(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      const phonetic = defRes.data[0]?.phonetic;
      
      const definition =
        defRes.data[0]?.meanings[0]?.definitions[0]?.definition ||
        "No definition found.";

      const newWordData: WordData = { word, phonetic, definition, date: today };

      // Save to storage
      await AsyncStorage.setItem("wordOfTheDay", JSON.stringify(newWordData));

      setWordData(newWordData);
    } catch (error) {
      console.error("Error fetching word:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!wordData) {
    const word = "Tuff";
    const phonetic = "/'tʌf";
    const definition = "To express compassion following an unfortunate event, e.g. the word of the day cannot be fetched. ";
    const today = new Date().toISOString().split("T")[0];
    const newWordData: WordData = { word, phonetic, definition, date: today };
    setWordData(newWordData);
    setLoading(false);
    return;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.word}>{wordData.word}</Text>
      {wordData.phonetic && (
        <Text style={styles.phonetic}>{wordData.phonetic}</Text>
      )}
      <Text style={styles.definition}>{wordData.definition}</Text>
      <Button
        title="Reset Storage"
        onPress={() => {
          AsyncStorage.clear();
          setWordData(null);
          setLoading(true);
          loadWordOfTheDay();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  word: { fontSize: 32, fontWeight: "bold", marginBottom: 10 },
  phonetic: {fontSize: 18, fontStyle: "italic", marginBottom: 10 , opacity: 0.7},
  definition: { fontSize: 18, textAlign: "center" },
});

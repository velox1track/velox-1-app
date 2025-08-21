import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Velox 1</Text>
          <Text style={styles.subtitle}>Track Competition Organizer</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={() => navigateTo('RaceRoulette')}
          >
            <Text style={styles.buttonText}>Race Roulette</Text>
            <Text style={styles.buttonSubtext}>Generate and reveal event sequences</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => navigateTo('TeamBuilder')}
          >
            <Text style={styles.buttonText}>Team Builder</Text>
            <Text style={styles.buttonSubtext}>Add athletes and manage teams</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.tertiaryButton]} 
            onPress={() => navigateTo('Scoreboard')}
          >
            <Text style={styles.buttonText}>Scoreboard</Text>
            <Text style={styles.buttonSubtext}>Track team scores and results</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.settingsButton]} 
            onPress={() => navigateTo('Settings')}
          >
            <Text style={styles.buttonText}>Settings</Text>
            <Text style={styles.buttonSubtext}>App configuration and data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Get started by creating your first event sequence or adding athletes!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  secondaryButton: {
    backgroundColor: '#27ae60',
  },
  tertiaryButton: {
    backgroundColor: '#f39c12',
  },
  settingsButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  buttonSubtext: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HomeScreen; 
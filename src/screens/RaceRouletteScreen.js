import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ActivityIndicator,
  SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventCard from '../components/EventCard';
import { generateEventSequence, getDefaultEventPool } from '../lib/randomizer';

const RaceRouletteScreen = () => {
  const [eventPool, setEventPool] = useState(getDefaultEventPool());
  const [totalEvents, setTotalEvents] = useState('5');
  const [numRelays, setNumRelays] = useState('1');
  const [relayPositions, setRelayPositions] = useState('');
  const [eventSequence, setEventSequence] = useState([]);
  const [revealedIndex, setRevealedIndex] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved state on component mount
  useEffect(() => {
    loadSavedState();
  }, []);

  const loadSavedState = async () => {
    try {
      const savedSequence = await AsyncStorage.getItem('eventSequence');
      const savedIndex = await AsyncStorage.getItem('revealedIndex');
      
      if (savedSequence) {
        setEventSequence(JSON.parse(savedSequence));
      }
      if (savedIndex) {
        setRevealedIndex(parseInt(savedIndex));
      }
    } catch (error) {
      console.log('Error loading saved state:', error);
    }
  };

  const saveState = async () => {
    try {
      await AsyncStorage.setItem('eventSequence', JSON.stringify(eventSequence));
      await AsyncStorage.setItem('revealedIndex', revealedIndex.toString());
    } catch (error) {
      console.log('Error saving state:', error);
    }
  };

  const generateSequence = () => {
    setIsLoading(true);
    
    const total = parseInt(totalEvents);
    const relays = parseInt(numRelays);
    let positions = [];
    
    if (relayPositions.trim()) {
      positions = relayPositions.split(',').map(pos => parseInt(pos.trim()) - 1);
    }
    
    const result = generateEventSequence(eventPool, total, relays, positions);
    
    if (result.success) {
      setEventSequence(result.sequence);
      setRevealedIndex(0);
      saveState();
      Alert.alert('Success', 'Event sequence generated!');
    } else {
      Alert.alert('Error', result.error);
    }
    
    setIsLoading(false);
  };

  const revealNextEvent = () => {
    if (revealedIndex >= eventSequence.length) {
      Alert.alert('Complete!', 'All events have been revealed!');
      return;
    }

    setIsRevealing(true);
    
    // Simulate loading animation
    setTimeout(() => {
      setRevealedIndex(prev => prev + 1);
      setIsRevealing(false);
      saveState();
    }, 1000);
  };

  const resetSequence = () => {
    Alert.alert(
      'Reset Sequence',
      'Are you sure you want to reset the current sequence?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setEventSequence([]);
            setRevealedIndex(0);
            saveState();
          }
        }
      ]
    );
  };

  const getNextEvent = () => {
    if (revealedIndex < eventSequence.length) {
      return eventSequence[revealedIndex];
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Controls Section */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Generate Event Sequence</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Total Events</Text>
              <TextInput
                style={styles.input}
                value={totalEvents}
                onChangeText={setTotalEvents}
                keyboardType="numeric"
                placeholder="5"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Number of Relays</Text>
              <TextInput
                style={styles.input}
                value={numRelays}
                onChangeText={setNumRelays}
                keyboardType="numeric"
                placeholder="1"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Relay Positions (Optional)</Text>
            <Text style={styles.helpText}>
              Comma-separated positions (e.g., "1,3,5")
            </Text>
            <TextInput
              style={styles.input}
              value={relayPositions}
              onChangeText={setRelayPositions}
              placeholder="Leave blank for random positions"
            />
          </View>

          <TouchableOpacity 
            style={styles.generateButton} 
            onPress={generateSequence}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Generate Sequence</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Reveal Section */}
        {eventSequence.length > 0 && (
          <View style={styles.revealSection}>
            <Text style={styles.sectionTitle}>Reveal Next Event</Text>
            
            <View style={styles.nextEventCard}>
              {isRevealing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#f39c12" />
                  <Text style={styles.loadingText}>Loading Event...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.nextEventLabel}>
                    Event #{revealedIndex + 1}
                  </Text>
                  <Text style={styles.nextEventName}>
                    {getNextEvent() || 'All events revealed!'}
                  </Text>
                  
                  {getNextEvent() && (
                    <TouchableOpacity 
                      style={styles.revealButton} 
                      onPress={revealNextEvent}
                    >
                      <Text style={styles.revealButtonText}>Reveal Event</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {revealedIndex} of {eventSequence.length} events revealed
              </Text>
            </View>
          </View>
        )}

        {/* Event Sequence Display */}
        {eventSequence.length > 0 && (
          <View style={styles.sequenceSection}>
            <View style={styles.sequenceHeader}>
              <Text style={styles.sectionTitle}>Event Sequence</Text>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={resetSequence}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
            
            {eventSequence.map((event, index) => (
              <EventCard
                key={index}
                event={event}
                index={index}
                isRevealed={index < revealedIndex}
                isNext={index === revealedIndex}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  scrollView: {
    flex: 1,
  },
  controlsSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
  },
  generateButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  revealSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextEventCard: {
    backgroundColor: '#f39c12',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  nextEventLabel: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },
  nextEventName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  revealButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  revealButtonText: {
    color: '#f39c12',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  sequenceSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  sequenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RaceRouletteScreen; 
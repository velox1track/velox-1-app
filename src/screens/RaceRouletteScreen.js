import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Alert,
  SafeAreaView,
  useWindowDimensions,
  Image,
  Pressable,
  Text
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventCard from '../components/EventCard';
import { generateEventSequence, getDefaultEventPool } from '../lib/randomizer';
import { MobileH1, MobileH2, MobileBody, MobileCaption } from '../components/Typography';
import { Card } from '../components/Card';
import { ButtonPrimary, ButtonSecondary } from '../components';
import { styleTokens } from '../theme';
import { scale } from '../utils/scale';

const RaceRouletteScreen = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  const [eventPool, setEventPool] = useState(getDefaultEventPool());
  const [totalEvents, setTotalEvents] = useState('5');
  const [numRelays, setNumRelays] = useState('1');
  const [relayPositions, setRelayPositions] = useState('');
  const [eventSequence, setEventSequence] = useState([]);
  const [revealedIndex, setRevealedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved state on component mount
  useEffect(() => {
    loadSavedState();
  }, []);

  const loadSavedState = async () => {
    try {
      const savedSequence = await AsyncStorage.getItem('eventSequence');
      const savedIndex = await AsyncStorage.getItem('revealedIndex');
      const savedEventPool = await AsyncStorage.getItem('eventPool');
      
      if (savedSequence) {
        setEventSequence(JSON.parse(savedSequence));
      }
      if (savedIndex) {
        setRevealedIndex(parseInt(savedIndex));
      }
      if (savedEventPool) {
        setEventPool(JSON.parse(savedEventPool));
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

    setRevealedIndex(prev => {
      const newIndex = prev + 1;
      return newIndex;
    });
    saveState();
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
      <ScrollView style={[styles.scrollView, isLandscape && styles.scrollViewLandscape]}>
        {/* Controls Section */}
        <Card style={[styles.controlsSection, isLandscape && styles.controlsSectionLandscape]}>
          <View style={[styles.controlsContent, isLandscape && styles.controlsContentLandscape]}>
            <MobileH2 style={[
              styles.sectionTitle, 
              isLandscape && styles.sectionTitleLandscape,
              width < 400 && styles.sectionTitleSmall,
              width < 350 && styles.sectionTitleTiny
            ]}>
              Generate Sequence
            </MobileH2>
            
            <View style={[styles.inputsContainer, isLandscape && styles.inputsContainerLandscape]}>
              <View style={styles.inputGroup}>
                <MobileBody style={styles.label}>Total Events</MobileBody>
                <TextInput
                  style={styles.input}
                  value={totalEvents}
                  onChangeText={setTotalEvents}
                  keyboardType="numeric"
                  placeholder="5"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <MobileBody style={styles.label}>Number of Relays</MobileBody>
                <TextInput
                  style={styles.input}
                  value={numRelays}
                  onChangeText={setNumRelays}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.relayPositionsGroup, isLandscape && styles.relayPositionsGroupLandscape]}>
              <MobileBody style={styles.label}>Relay Positions (Optional)</MobileBody>
              <MobileCaption style={[
                styles.helpText,
                isLandscape && styles.helpTextLandscape,
                width < 400 && styles.helpTextSmall,
                width < 350 && styles.helpTextTiny
              ]}>
                Comma-separated (e.g., "1,3,5")
              </MobileCaption>
              <TextInput
                style={styles.input}
                value={relayPositions}
                onChangeText={setRelayPositions}
                placeholder="Leave blank for random positions"
              />
            </View>

            <ButtonPrimary 
              style={styles.generateButton} 
              onPress={generateSequence}
              disabled={isLoading}
              title={isLoading ? 'Generating...' : 'Generate Sequence'}
            />
          </View>
        </Card>

        {/* Reveal Section */}
        {eventSequence.length > 0 && (
          <Card style={[styles.revealSection, isLandscape && styles.revealSectionLandscape]}>
            <MobileH2 style={[
              styles.sectionTitle, 
              isLandscape && styles.sectionTitleLandscape,
              width < 400 && styles.sectionTitleSmall,
              width < 350 && styles.sectionTitleTiny
            ]}>
              Reveal Next Event
            </MobileH2>
            
            {/* Futuristic Digital Screen Simulator */}
            <View style={styles.digitalScreenContainer}>
              {/* Main Digital Screen */}
              <View style={styles.digitalScreen}>
                {/* Corner Mounting Brackets */}
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
                
                {/* Circuit Pattern Background */}
                <View style={styles.circuitPattern} />
                
                {/* Scan Line Effect */}
                <View style={styles.scanLine} />
                
                {/* Screen Content */}
                <View style={styles.screenContent}>
                  {/* Header */}
                  <View style={styles.screenHeader}>
                    <View style={styles.logoContainer}>
                      <Image source={require('../../Images/minimal_logo.png')} style={styles.logoImage} />
                    </View>
                    <Text style={styles.raceControlText}>RACE CONTROL</Text>
                  </View>
                  
                  {/* Main Display */}
                  <View style={styles.mainDisplay}>
                    <Text style={styles.mainTitle}>
                      {getNextEvent() || 'RACE ROULETTE'}
                    </Text>
                    
                    {getNextEvent() && (
                      <Text style={styles.eventNumber}>
                        Event #{revealedIndex + 1}
                      </Text>
                    )}
                  </View>
                  
                  {/* Footer */}
                  <View style={styles.screenFooter}>
                    <Text style={styles.versionText}>VELOX-1.0</Text>
                  </View>
                </View>
              </View>
              
              {/* Reveal Button */}
              {getNextEvent() && (
                <Pressable 
                  style={styles.revealButton}
                  onPress={revealNextEvent}
                >
                  <Text style={styles.revealButtonText}>REVEAL EVENT</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.progressInfo}>
              <MobileCaption style={styles.progressText}>
                {revealedIndex} of {eventSequence.length} events revealed
              </MobileCaption>
            </View>
          </Card>
        )}

        {/* Event Sequence Display */}
        {eventSequence.length > 0 && (
          <Card style={[styles.sequenceSection, isLandscape && styles.sequenceSectionLandscape]}>
            <View style={[styles.sequenceHeader, isLandscape && styles.sequenceHeaderLandscape]}>
              <MobileH2 style={[
                styles.sectionTitle, 
                isLandscape && styles.sectionTitleLandscape,
                width < 400 && styles.sectionTitleSmall,
                width < 350 && styles.sectionTitleTiny
              ]}>
                Event Sequence
              </MobileH2>
              <ButtonSecondary 
                style={styles.resetButton} 
                onPress={resetSequence}
                title="Reset"
              />
            </View>
            
            <View style={[styles.sequenceGrid, isLandscape && styles.sequenceGridLandscape]}>
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
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleTokens.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: scale(24),
  },
  scrollViewLandscape: {
    padding: scale(24),
    maxWidth: '100%', // Prevents content from extending beyond screen
  },
  controlsSection: {
    marginBottom: scale(24),
    padding: scale(20),
    minHeight: scale(120),
    maxWidth: '100%', // Prevents section from extending beyond screen
  },
  controlsSectionLandscape: {
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: scale(24), // More padding for landscape
  },
  controlsContent: {
    flex: 1,
  },
  controlsContentLandscape: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  inputsContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  inputsContainerLandscape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: scale(24),
    marginBottom: scale(16),
    width: '100%',
  },
  sectionTitle: {
    color: styleTokens.colors.textPrimary,
    marginBottom: scale(20),
    textAlign: 'center',
    fontSize: scale(18), // Even smaller for portrait to ensure fit
    lineHeight: scale(22),
    flexShrink: 1, // Allow text to shrink if needed
    flexWrap: 'wrap', // Enable text wrapping
    paddingHorizontal: scale(8), // Add horizontal padding to prevent edge clipping
  },
  sectionTitleLandscape: {
    fontSize: scale(24), // Larger size for landscape
    lineHeight: scale(28),
    paddingHorizontal: scale(12), // More padding for landscape
  },
  sectionTitleSmall: {
    fontSize: scale(16), // Smaller font size for very small screens
    lineHeight: scale(20),
    paddingHorizontal: scale(4), // Less padding for small screens
  },
  sectionTitleTiny: {
    fontSize: scale(14), // Even smaller font size for extremely narrow screens
    lineHeight: scale(18),
    paddingHorizontal: scale(2), // Less padding for tiny screens
  },
  inputGroup: {
    marginBottom: scale(16),
    flex: 1,
    minWidth: 0, // Prevents flex items from overflowing
  },
  label: {
    color: styleTokens.colors.textSecondary,
    marginBottom: scale(8),
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: styleTokens.colors.border,
    borderRadius: styleTokens.components.input.borderRadius,
    padding: scale(12),
    backgroundColor: styleTokens.components.input.backgroundColor,
    color: styleTokens.colors.textPrimary,
    fontSize: scale(16),
    minHeight: scale(48),
    flex: 1,
    minWidth: 0, // Prevents flex items from overflowing
  },
  helpText: {
    color: styleTokens.colors.textSecondary,
    fontSize: scale(11), // Smaller base font size for portrait
    marginTop: scale(4),
    opacity: 0.7,
    textAlign: 'center',
    flexShrink: 1,
    flexWrap: 'wrap',
    paddingHorizontal: scale(2), // Reduced padding for portrait
    lineHeight: scale(14), // Tighter line height for portrait
  },
  helpTextLandscape: {
    fontSize: scale(14),
    paddingHorizontal: scale(8),
    lineHeight: scale(18), // More comfortable line height for landscape
  },
  helpTextSmall: {
    fontSize: scale(10), // Even smaller for very small screens
    paddingHorizontal: scale(1),
    lineHeight: scale(12),
  },
  helpTextTiny: {
    fontSize: scale(9), // Tiny font for extremely narrow screens
    paddingHorizontal: scale(0),
    lineHeight: scale(11),
  },
  generateButton: {
    marginTop: scale(16),
    alignSelf: 'center',
    minWidth: scale(200),
    maxWidth: '100%', // Prevents button from extending beyond container
  },
  revealSection: {
    marginBottom: scale(24),
    padding: scale(20),
    minHeight: scale(120),
  },
  revealSectionLandscape: {
    padding: scale(24), // More padding for landscape
    marginBottom: scale(24),
  },
  digitalScreenContainer: {
    alignItems: 'center',
    marginBottom: scale(16),
  },
  digitalScreen: {
    width: scale(320),
    height: scale(200),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45A196',
    borderRadius: scale(20),
    borderWidth: scale(8),
    borderColor: 'rgba(100, 226, 211, 0.8)',
    shadowColor: 'rgba(100, 226, 211, 0.9)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: scale(25),
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  screenContent: {
    width: '100%',
    height: '100%',
    padding: scale(20),
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: scale(12),
    // Add subtle digital screen texture
    borderWidth: 1,
    borderColor: 'rgba(100, 226, 211, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.8)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: scale(8),
    elevation: 4,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(16),
    paddingBottom: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100, 226, 211, 0.3)',
    width: '100%',
    justifyContent: 'space-between',
  },
  logoContainer: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Ensure the logo fits properly within the container
  },
  raceControlText: {
    color: 'rgba(100, 226, 211, 0.9)',
    fontSize: scale(8), // Match website font size
    fontWeight: 'bold',
    letterSpacing: scale(1.2),
  },
  mainDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  mainTitle: {
    color: '#64E2D3',
    marginBottom: scale(8),
    textAlign: 'center',
    fontSize: scale(28),
    fontWeight: 'bold',
    letterSpacing: scale(2),
  },
  eventNumber: {
    color: '#64E2D3',
    fontSize: scale(16),
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: scale(1),
  },
  screenFooter: {
    marginTop: scale(16),
    paddingTop: scale(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 226, 211, 0.3)',
    width: '100%',
    alignItems: 'center',
  },
  versionText: {
    color: 'rgba(100, 226, 211, 0.8)',
    fontSize: scale(8), // Match website font size
    fontWeight: 'bold',
    letterSpacing: scale(0.8),
  },
  revealButton: {
    minWidth: scale(160),
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderWidth: scale(3),
    borderColor: '#64E2D3',
    borderRadius: scale(12),
    shadowColor: 'rgba(100, 226, 211, 0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: scale(6),
    elevation: 6,
    marginTop: scale(16),
    paddingVertical: scale(16),
    paddingHorizontal: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealButtonText: {
    color: '#64E2D3',
    fontSize: scale(16),
    fontWeight: 'bold',
    letterSpacing: scale(1),
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    color: styleTokens.colors.textSecondary,
    opacity: 0.8,
  },
  sequenceSection: {
    marginBottom: scale(24),
    padding: scale(20),
    minHeight: scale(120),
  },
  sequenceSectionLandscape: {
    padding: scale(24), // More padding for landscape
    marginBottom: scale(24),
  },
  sequenceGrid: {
    flexDirection: 'column',
    gap: scale(16),
  },
  sequenceGridLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: scale(16),
  },
  sequenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(20),
    flexWrap: 'wrap', // Allow wrapping in portrait mode
    gap: scale(12), // Add gap between title and button
  },
  sequenceHeaderLandscape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(20),
    gap: scale(16), // Larger gap for landscape
  },
  resetButton: {
    minWidth: scale(80),
  },
  relayPositionsGroup: {
    marginBottom: scale(16),
    width: '100%',
    alignItems: 'stretch',
    paddingHorizontal: scale(2), // Add small padding for portrait
  },
  relayPositionsGroupLandscape: {
    width: '100%',
    marginBottom: scale(16),
    alignItems: 'stretch',
    paddingHorizontal: scale(4),
  },
  cornerTL: {
    position: 'absolute',
    top: scale(8),
    left: scale(8),
    width: scale(6),
    height: scale(6),
    backgroundColor: '#444',
    borderRadius: scale(3),
    zIndex: 4,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: scale(2),
    elevation: 2,
  },
  cornerTR: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    width: scale(6),
    height: scale(6),
    backgroundColor: '#444',
    borderRadius: scale(3),
    zIndex: 4,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: scale(2),
    elevation: 2,
  },
  cornerBL: {
    position: 'absolute',
    bottom: scale(8),
    left: scale(8),
    width: scale(6),
    height: scale(6),
    backgroundColor: '#444',
    borderRadius: scale(3),
    zIndex: 4,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: scale(2),
    elevation: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: scale(8),
    right: scale(8),
    width: scale(6),
    height: scale(6),
    backgroundColor: '#444',
    borderRadius: scale(3),
    zIndex: 4,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: scale(2),
    elevation: 2,
  },
  circuitPattern: {
    position: 'absolute',
    top: scale(16),
    left: scale(16),
    right: scale(16),
    bottom: scale(16),
    backgroundColor: 'transparent',
    borderRadius: scale(8),
    opacity: 0.3,
    zIndex: 1,
    // Create a more realistic circuit pattern
    borderWidth: 1,
    borderColor: 'rgba(100, 226, 211, 0.2)',
    borderStyle: 'dashed',
  },
  scanLine: {
    position: 'absolute',
    top: scale(16),
    left: scale(16),
    right: scale(16),
    height: scale(2),
    backgroundColor: 'rgba(100, 226, 211, 0.4)',
    zIndex: 5,
    borderRadius: scale(12),
    shadowColor: 'rgba(100, 226, 211, 0.8)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: scale(4),
  },
});

export default RaceRouletteScreen; 
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert,
  SafeAreaView,
  Dimensions,
  useWindowDimensions,
  TouchableOpacity,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileH1, MobileH2, MobileBody, MobileCaption } from '../components/Typography';
import { Card } from '../components/Card';
import { ButtonPrimary, ButtonSecondary } from '../components';
import { styleTokens } from '../theme';
import { scale } from '../utils/scale';
import { getDefaultEventPool } from '../lib/randomizer';

const SettingsScreen = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  const [dataStats, setDataStats] = useState({
    athletes: 0,
    teams: 0,
    eventSequence: 0,
    eventResults: 0
  });

  // Event configuration state
  const [selectedCategory, setSelectedCategory] = useState('shortSprints');
  const [eventPool, setEventPool] = useState(getDefaultEventPool());
  const [showEventConfig, setShowEventConfig] = useState(false);

  // Animated values for smooth toggle transitions
  const toggleAnimations = useRef({});

  // Initialize animations for each event
  const initializeToggleAnimation = (category, eventName) => {
    const key = `${category}-${eventName}`;
    if (!toggleAnimations.current[key]) {
      toggleAnimations.current[key] = new Animated.Value(0);
    }
  };

  // Get animation value for an event
  const getToggleAnimation = (category, eventName) => {
    const key = `${category}-${eventName}`;
    if (!toggleAnimations.current[key]) {
      initializeToggleAnimation(category, eventName);
    }
    return toggleAnimations.current[key];
  };

  // Event categories
  const eventCategories = {
    shortSprints: 'Short\nSprints',
    middleDistances: 'Middle\nDistances', 
    longDistances: 'Long\nDistances',
    relays: 'Relay\nRaces',
    technicalEvents: 'Technical\nEvents'
  };

  // Load data stats and event pool on component mount
  useEffect(() => {
    loadSavedState();
  }, []);

  // Initialize toggle animations when event pool changes
  useEffect(() => {
    Object.keys(eventPool).forEach(category => {
      eventPool[category].forEach(event => {
        initializeToggleAnimation(category, event.name);
        const animation = getToggleAnimation(category, event.name);
        // Set initial position based on current enabled state
        animation.setValue(event.enabled ? 1 : 0);
      });
    });
  }, [eventPool]);

  const loadSavedState = async () => {
    try {
      const athletes = await AsyncStorage.getItem('athletes');
      const teams = await AsyncStorage.getItem('teams');
      const eventSequence = await AsyncStorage.getItem('eventSequence');
      const eventResults = await AsyncStorage.getItem('eventResults');
      const savedEventPool = await AsyncStorage.getItem('eventPool');
      
      setDataStats({
        athletes: athletes ? JSON.parse(athletes).length : 0,
        teams: teams ? JSON.parse(teams).length : 0,
        eventSequence: eventSequence ? JSON.parse(eventSequence).length : 0,
        eventResults: eventResults ? JSON.parse(eventResults).length : 0
      });

      if (savedEventPool) {
        setEventPool(JSON.parse(savedEventPool));
      } else {
        // Use the updated default event pool if no saved data exists
        setEventPool(getDefaultEventPool());
      }
    } catch (error) {
      console.log('Error loading saved state:', error);
    }
  };

  const saveEventPool = async (newEventPool) => {
    try {
      await AsyncStorage.setItem('eventPool', JSON.stringify(newEventPool));
      setEventPool(newEventPool);
    } catch (error) {
      console.log('Error saving event pool:', error);
    }
  };

  const toggleEvent = (category, eventName) => {
    const newEventPool = { ...eventPool };
    const eventIndex = newEventPool[category].findIndex(event => event.name === eventName);
    
    if (eventIndex !== -1) {
      const newEnabled = !newEventPool[category][eventIndex].enabled;
      newEventPool[category][eventIndex] = { 
        ...newEventPool[category][eventIndex], 
        enabled: newEnabled 
      };
      
      // Animate the toggle
      const animation = getToggleAnimation(category, eventName);
      Animated.timing(animation, {
        toValue: newEnabled ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      saveEventPool(newEventPool);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Event Pool',
      'This will reset all events to their default enabled/disabled state. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset to Defaults', 
          onPress: () => {
            const defaultPool = getDefaultEventPool();
            saveEventPool(defaultPool);
            
            // Reset all animations to their default state
            Object.keys(defaultPool).forEach(category => {
              defaultPool[category].forEach(event => {
                const animation = getToggleAnimation(category, event.name);
                Animated.timing(animation, {
                  toValue: event.enabled ? 1 : 0,
                  duration: 300,
                  useNativeDriver: false,
                }).start();
              });
            });
            
            Alert.alert('Success', 'Event pool reset to defaults.');
          }
        }
      ]
    );
  };

  const refreshToLatestDefaults = () => {
    Alert.alert(
      'Refresh Event Pool',
      'This will update the event pool to include any new events that have been added to the defaults. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Refresh to Latest', 
          onPress: () => {
            const latestPool = getDefaultEventPool();
            saveEventPool(latestPool);
            
            // Initialize animations for new events
            Object.keys(latestPool).forEach(category => {
              latestPool[category].forEach(event => {
                initializeToggleAnimation(category, event.name);
                const animation = getToggleAnimation(category, event.name);
                animation.setValue(event.enabled ? 1 : 0);
              });
            });
            
            Alert.alert('Success', 'Event pool refreshed to latest defaults.');
          }
        }
      ]
    );
  };

  const getEventPoolStats = () => {
    const stats = {
      total: 0,
      byCategory: {}
    };

    Object.keys(eventPool).forEach(category => {
      const enabledCount = eventPool[category].filter(event => event.enabled).length;
      const totalCount = eventPool[category].length;
      
      stats.byCategory[category] = {
        enabled: enabledCount,
        total: totalCount
      };
      stats.total += enabledCount;
    });

    return stats;
  };

  const stats = getEventPoolStats();

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all athletes, teams, event sequences, and results. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'athletes',
                'teams', 
                'eventSequence',
                'revealedIndex',
                'eventResults'
              ]);
              
              setDataStats({
                athletes: 0,
                teams: 0,
                eventSequence: 0,
                eventResults: 0
              });
              
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          }
        }
      ]
    );
  };

  const clearSpecificData = (dataType, key) => {
    const dataNames = {
      athletes: 'Athletes',
      teams: 'Teams',
      eventSequence: 'Event Sequence',
      eventResults: 'Event Results'
    };

    Alert.alert(
      `Clear ${dataNames[dataType]}`,
      `This will permanently delete all ${dataNames[dataType].toLowerCase()}. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: `Clear ${dataNames[dataType]}`, 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(key);
              
              setDataStats(prev => ({
                ...prev,
                [dataType]: 0
              }));
              
              Alert.alert('Success', `${dataNames[dataType]} have been cleared.`);
            } catch (error) {
              Alert.alert('Error', `Failed to clear ${dataNames[dataType].toLowerCase()}.`);
            }
          }
        }
      ]
    );
  };

  const exportData = async () => {
    try {
      const athletes = await AsyncStorage.getItem('athletes');
      const teams = await AsyncStorage.getItem('teams');
      const eventSequence = await AsyncStorage.getItem('eventSequence');
      const eventResults = await AsyncStorage.getItem('eventResults');
      
      const exportData = {
        athletes: athletes ? JSON.parse(athletes) : [],
        teams: teams ? JSON.parse(teams) : [],
        eventSequence: eventSequence ? JSON.parse(eventSequence) : [],
        eventResults: eventResults ? JSON.parse(eventResults) : [],
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0'
      };
      
      // In a real app, you would implement actual export functionality
      // For now, we'll just show the data structure
      Alert.alert(
        'Export Data',
        `Data export prepared:\n\n` +
        `Athletes: ${exportData.athletes.length}\n` +
        `Teams: ${exportData.teams.length}\n` +
        `Events: ${exportData.eventSequence.length}\n` +
        `Results: ${exportData.eventResults.length}\n\n` +
        `Export functionality would save this data to a file or cloud storage.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to prepare data export.');
    }
  };

  const resetEventProgress = async () => {
    Alert.alert(
      'Reset Event Progress',
      'This will reset the event sequence progress (revealed events) but keep the sequence itself.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset Progress', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('revealedIndex');
              Alert.alert('Success', 'Event progress has been reset.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset event progress.');
            }
          }
        }
      ]
    );
  };

  const getCategoryAbbreviation = (category) => {
    switch (category) {
      case 'shortSprints':
        return 'SS';
      case 'middleDistances':
        return 'MD';
      case 'longDistances':
        return 'LD';
      case 'relays':
        return 'R';
      case 'technicalEvents':
        return 'TE';
      default:
        return category.charAt(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isLandscape && styles.scrollContentLandscape
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Configuration Section */}
        <Card style={[
          styles.section,
          isLandscape && styles.sectionLandscape
        ]}>
          <MobileH2 style={[
            styles.sectionTitle,
            isLandscape && styles.sectionTitleLandscape
          ]}>Event Configuration</MobileH2>
          <View style={styles.eventConfigContainer}>
            <View style={[
              styles.totalEnabledContainer,
              isLandscape && styles.totalEnabledContainerLandscape
            ]}>
              <MobileH1 style={[
                styles.totalEnabledNumber,
                isLandscape && styles.totalEnabledNumberLandscape
              ]}>{stats.total}</MobileH1>
              <MobileBody style={[
                styles.totalEnabledLabel,
                isLandscape && styles.totalEnabledLabelLandscape
              ]}>Total Enabled Events</MobileBody>
            </View>

            <View style={isLandscape ? styles.categorySelectorLandscape : styles.categorySelector}>
              <MobileBody style={styles.categoryLabel}>Select Event Category:</MobileBody>
              <View style={styles.categoryButtons}>
                <View style={[
                  styles.categoryRow,
                  styles.firstRow,
                  isLandscape && styles.categoryRowLandscape,
                  isLandscape && styles.firstRowLandscape
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      isLandscape && styles.categoryButtonLandscape,
                      selectedCategory === 'shortSprints' && styles.categoryButtonSelected
                    ]}
                    onPress={() => setSelectedCategory('shortSprints')}
                  >
                    <MobileBody style={[
                      styles.categoryButtonText,
                      selectedCategory === 'shortSprints' && styles.categoryButtonTextSelected
                    ]}>
                      {eventCategories.shortSprints}
                    </MobileBody>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      isLandscape && styles.categoryButtonLandscape,
                      selectedCategory === 'middleDistances' && styles.categoryButtonSelected
                    ]}
                    onPress={() => setSelectedCategory('middleDistances')}
                  >
                    <MobileBody style={[
                      styles.categoryButtonText,
                      selectedCategory === 'middleDistances' && styles.categoryButtonTextSelected
                    ]}>
                      {eventCategories.middleDistances}
                    </MobileBody>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      isLandscape && styles.categoryButtonLandscape,
                      selectedCategory === 'longDistances' && styles.categoryButtonSelected
                    ]}
                    onPress={() => setSelectedCategory('longDistances')}
                  >
                    <MobileBody style={[
                      styles.categoryButtonText,
                      selectedCategory === 'longDistances' && styles.categoryButtonTextSelected
                    ]}>
                      {eventCategories.longDistances}
                    </MobileBody>
                  </TouchableOpacity>
                </View>
                
                <View style={[
                  styles.categoryRow,
                  styles.secondRow,
                  isLandscape && styles.categoryRowLandscape,
                  isLandscape && styles.secondRowLandscape
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      isLandscape && styles.categoryButtonLandscape,
                      selectedCategory === 'relays' && styles.categoryButtonSelected
                    ]}
                    onPress={() => setSelectedCategory('relays')}
                  >
                    <MobileBody style={[
                      styles.categoryButtonText,
                      selectedCategory === 'relays' && styles.categoryButtonTextSelected
                    ]}>
                      {eventCategories.relays}
                    </MobileBody>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      isLandscape && styles.categoryButtonLandscape,
                      selectedCategory === 'technicalEvents' && styles.categoryButtonSelected
                    ]}
                    onPress={() => setSelectedCategory('technicalEvents')}
                  >
                    <MobileBody style={[
                      styles.categoryButtonText,
                      selectedCategory === 'technicalEvents' && styles.categoryButtonTextSelected
                    ]}>
                      {eventCategories.technicalEvents}
                    </MobileBody>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.eventListContainer}>
              <MobileH2 style={styles.eventListTitle}>
                {eventCategories[selectedCategory]} Events
              </MobileH2>
              {eventPool[selectedCategory]?.map((event, index) => (
                <View key={index} style={[
                  styles.eventItem,
                  !event.enabled && styles.eventItemDisabled
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.eventToggle,
                      event.enabled && styles.toggleEnabled
                    ]}
                    onPress={() => toggleEvent(selectedCategory, event.name)}
                  >
                    <Animated.View 
                      style={[
                        styles.toggleCircle,
                        {
                          left: getToggleAnimation(selectedCategory, event.name).interpolate({
                            inputRange: [0, 1],
                            outputRange: [scale(2), scale(18)]
                          })
                        }
                      ]} 
                    />
                  </TouchableOpacity>
                  <MobileBody style={[
                    styles.eventName,
                    !event.enabled && styles.eventNameDisabled
                  ]}>{event.name}</MobileBody>
                </View>
              ))}
            </View>

            <View style={styles.breakdownContainer}>
              <MobileBody style={styles.breakdownLabel}>Breakdown by Category:</MobileBody>
              <View style={styles.breakdownTable}>
                {Object.keys(stats.byCategory).map(category => (
                  <View key={category} style={styles.breakdownRow}>
                    <MobileCaption style={styles.breakdownCategory}>
                      {getCategoryAbbreviation(category)}
                    </MobileCaption>
                    <MobileCaption style={styles.breakdownCount}>
                      {stats.byCategory[category].enabled}/{stats.byCategory[category].total}
                    </MobileCaption>
                  </View>
                ))}
              </View>
            </View>

            <View style={[
              styles.buttonGroup,
              isLandscape && styles.buttonGroupLandscape
            ]}>
              <ButtonSecondary 
                title="Reset to Default"
                onPress={resetToDefaults}
                style={styles.resetDefaultsButton}
                textStyle={styles.buttonTextSmall}
              />
              <ButtonSecondary 
                title="Refresh to Latest Events"
                onPress={refreshToLatestDefaults}
                style={styles.refreshDefaultsButton}
                textStyle={styles.buttonTextSmall}
              />
            </View>
          </View>
        </Card>

        {/* Data Statistics Section */}
        <Card style={[
          styles.section,
          isLandscape && styles.sectionLandscape
        ]}>
          <MobileH2 style={[
            styles.sectionTitle,
            isLandscape && styles.sectionTitleLandscape
          ]}>Data Statistics</MobileH2>
          <View style={[
            styles.statsGrid,
            isLandscape && styles.statsGridLandscape
          ]}>
            <View style={styles.statItem}>
              <MobileH1 style={styles.statNumber}>{dataStats.athletes}</MobileH1>
              <MobileCaption style={styles.statLabel}>Athletes</MobileCaption>
            </View>
            <View style={styles.statItem}>
              <MobileH1 style={styles.statNumber}>{dataStats.teams}</MobileH1>
              <MobileCaption style={styles.statLabel}>Teams</MobileCaption>
            </View>
            <View style={styles.statItem}>
              <MobileH1 style={styles.statNumber}>{dataStats.eventSequence}</MobileH1>
              <MobileCaption style={styles.statLabel}>Events</MobileCaption>
            </View>
            <View style={styles.statItem}>
              <MobileH1 style={styles.statNumber}>{dataStats.eventResults}</MobileH1>
              <MobileCaption style={styles.statLabel}>Results</MobileCaption>
            </View>
          </View>
        </Card>

        {/* Data Management Section */}
        <Card style={[
          styles.section,
          isLandscape && styles.sectionLandscape
        ]}>
          <MobileH2 style={[
            styles.sectionTitle,
            isLandscape && styles.sectionTitleLandscape
          ]}>Data Management</MobileH2>
          
          <View style={[
            styles.buttonGroup,
            isLandscape && styles.buttonGroupLandscape
          ]}>
            <ButtonSecondary 
              title="Export All Data to File"
              onPress={exportData}
              style={styles.managementButton}
            />
            <ButtonSecondary 
              title="Reset Event Progress (Keep Sequence)"
              onPress={resetEventProgress}
              style={styles.managementButton}
            />
          </View>

          <View style={[
            styles.clearButtonsContainer,
            isLandscape && styles.clearButtonsContainerLandscape
          ]}>
            <ButtonSecondary 
              title="Clear All Athletes"
              onPress={() => clearSpecificData('athletes', 'athletes')}
              style={styles.clearButton}
            />
            <ButtonSecondary 
              title="Clear All Teams"
              onPress={() => clearSpecificData('teams', 'teams')}
              style={styles.clearButton}
            />
            <ButtonSecondary 
              title="Clear Event Sequence"
              onPress={() => clearSpecificData('eventSequence', 'eventSequence')}
              style={styles.clearButton}
            />
            <ButtonSecondary 
              title="Clear Event Results"
              onPress={() => clearSpecificData('eventResults', 'eventResults')}
              style={styles.clearButton}
            />
          </View>

          <View style={styles.dangerZone}>
            <MobileH2 style={styles.dangerZoneTitle}>⚠️ Danger Zone</MobileH2>
            <MobileBody style={styles.dangerZoneText}>
              These actions will permanently delete data and cannot be undone.
            </MobileBody>
            <ButtonSecondary 
              title="Clear All Data (Permanent)"
              onPress={clearAllData}
              style={styles.dangerButton}
            />
          </View>
        </Card>

        {/* App Info Section */}
        <Card style={[
          styles.section,
          isLandscape && styles.sectionLandscape
        ]}>
          <MobileH2 style={[
            styles.sectionTitle,
            isLandscape && styles.sectionTitleLandscape
          ]}>App Information</MobileH2>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <MobileBody style={styles.infoLabel}>App Name</MobileBody>
              <MobileBody style={styles.infoValue}>Velox 1 Race Roulette</MobileBody>
            </View>
            <View style={styles.infoRow}>
              <MobileBody style={styles.infoLabel}>Version</MobileBody>
              <MobileBody style={styles.infoValue}>1.0.0</MobileBody>
            </View>
            <View style={styles.infoRow}>
              <MobileBody style={styles.infoLabel}>Description</MobileBody>
              <MobileBody style={styles.infoValue}>Track Competition Organizer</MobileBody>
            </View>
          </View>
        </Card>
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
  },
  scrollContent: {
    padding: scale(24),
    paddingBottom: scale(40),
  },
  scrollContentLandscape: {
    paddingHorizontal: scale(32),
    paddingVertical: scale(20),
  },
  section: {
    marginBottom: scale(24),
    padding: scale(20),
    minHeight: scale(120),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: scale(12),
    shadowColor: styleTokens.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionLandscape: {
    padding: scale(24),
    minHeight: scale(100),
  },
  sectionTitle: {
    color: styleTokens.colors.textPrimary,
    marginBottom: scale(20),
    textAlign: 'center',
    fontWeight: '700',
    fontSize: scale(18),
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sectionTitleLandscape: {
    fontSize: scale(20),
    marginBottom: scale(16),
  },
  infoContainer: {
    gap: scale(8),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  infoLabel: {
    color: styleTokens.colors.textSecondary,
    fontWeight: '600',
    fontSize: scale(16),
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  infoValue: {
    color: styleTokens.colors.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: scale(16),
    fontSize: scale(16),
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: scale(16),
    paddingHorizontal: scale(8),
  },
  statsGridLandscape: {
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: scale(80),
    paddingVertical: scale(12),
    paddingHorizontal: scale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    color: styleTokens.colors.primary,
    marginBottom: scale(8),
    fontSize: scale(32),
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  statLabel: {
    color: styleTokens.colors.textSecondary,
    textAlign: 'center',
    fontSize: scale(14),
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  buttonGroup: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: scale(24),
    gap: scale(16),
    width: '100%',
  },
  buttonGroupLandscape: {
    alignItems: 'center',
    gap: scale(16),
    width: '100%',
  },
  managementButton: {
    width: '100%',
    maxWidth: scale(300),
    minWidth: scale(250),
  },
  clearButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: scale(16),
    marginBottom: scale(24),
    width: '100%',
  },
  clearButtonsContainerLandscape: {
    alignItems: 'center',
    gap: scale(16),
    width: '100%',
  },
  clearButton: {
    width: '100%',
    maxWidth: scale(300),
    minWidth: scale(250),
  },
  dangerZone: {
    backgroundColor: 'rgba(253, 246, 227, 0.15)',
    padding: scale(20),
    borderRadius: scale(12),
    marginTop: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  dangerZoneTitle: {
    color: '#ff6b6b',
    marginBottom: scale(12),
    textAlign: 'center',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dangerZoneText: {
    color: styleTokens.colors.textSecondary,
    marginBottom: scale(16),
    textAlign: 'center',
    fontSize: scale(15),
    lineHeight: scale(22),
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  dangerButton: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff5252',
    alignSelf: 'center',
    width: '100%',
    maxWidth: scale(300),
    minWidth: scale(250),
  },
  // New styles for Event Configuration
  eventConfigContainer: {
    marginTop: scale(20),
    padding: scale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: scale(12),
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    width: '100%',
  },
  categorySelector: {
    alignItems: 'center',
    marginBottom: scale(24),
    width: '100%',
  },
  categorySelectorLandscape: {
    alignItems: 'center',
    marginBottom: scale(20),
    width: '100%',
  },
  categoryLabel: {
    color: styleTokens.colors.textSecondary,
    marginBottom: scale(16),
    fontSize: scale(16),
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  categoryButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '100%',
    gap: scale(6),
    width: '100%',
  },
  categoryButton: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(6),
    borderRadius: scale(6),
    minWidth: scale(80),
    maxWidth: scale(100),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(40),
  },
  categoryButtonLandscape: {
    paddingVertical: scale(6),
    paddingHorizontal: scale(6),
    borderRadius: scale(5),
    minWidth: scale(70),
    maxWidth: scale(90),
    minHeight: scale(35),
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(4),
    width: '100%',
  },
  categoryRowLandscape: {
    gap: scale(3),
  },
  firstRow: {
    justifyContent: 'center',
    gap: scale(4),
  },
  firstRowLandscape: {
    gap: scale(3),
  },
  secondRow: {
    justifyContent: 'center',
    gap: scale(8),
  },
  secondRowLandscape: {
    gap: scale(6),
  },
  categoryButtonSelected: {
    backgroundColor: styleTokens.colors.primary,
    shadowColor: styleTokens.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryButtonText: {
    color: styleTokens.colors.textSecondary,
    fontWeight: '600',
    fontSize: scale(8),
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    flexWrap: 'wrap',
    lineHeight: scale(10),
  },
  categoryButtonTextSelected: {
    color: styleTokens.colors.textPrimary,
    fontWeight: '700',
  },
  eventListContainer: {
    marginBottom: scale(24),
  },
  eventListTitle: {
    color: styleTokens.colors.textPrimary,
    marginBottom: scale(12),
    textAlign: 'center',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: scale(8),
  },
  eventItemDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.6,
    borderWidth: 1,
  },
  eventToggle: {
    width: scale(36),
    height: scale(20),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(159, 167, 174, 0.3)',
  },
  toggleCircle: {
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
    left: scale(2),
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleCircleEnabled: {
    backgroundColor: styleTokens.colors.white,
    left: scale(18),
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleEnabled: {
    backgroundColor: styleTokens.colors.primary,
    borderColor: styleTokens.colors.primary,
  },
  eventName: {
    flex: 1,
    color: styleTokens.colors.textPrimary,
    fontSize: scale(16),
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  eventNameDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  totalEnabledContainer: {
    alignItems: 'center',
    marginBottom: scale(20),
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
  },
  totalEnabledContainerLandscape: {
    alignItems: 'center',
    marginBottom: scale(16),
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
  },
  totalEnabledNumber: {
    color: styleTokens.colors.primary,
    marginBottom: scale(4),
    fontSize: scale(36),
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  totalEnabledNumberLandscape: {
    color: styleTokens.colors.primary,
    marginBottom: scale(3),
    fontSize: scale(32),
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  totalEnabledLabel: {
    color: styleTokens.colors.textSecondary,
    fontSize: scale(14),
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  totalEnabledLabelLandscape: {
    color: styleTokens.colors.textSecondary,
    fontSize: scale(13),
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  breakdownContainer: {
    marginTop: scale(16),
    padding: scale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: scale(12),
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    width: '100%',
  },
  breakdownLabel: {
    color: styleTokens.colors.textSecondary,
    marginBottom: scale(12),
    fontSize: scale(16),
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  breakdownTable: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: scale(8),
    overflow: 'hidden',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  breakdownCategory: {
    color: styleTokens.colors.textSecondary,
    fontSize: scale(14),
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  breakdownCount: {
    color: styleTokens.colors.textPrimary,
    fontSize: scale(14),
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  resetDefaultsButton: {
    width: '100%',
    maxWidth: scale(300),
    minWidth: scale(250),
    marginBottom: scale(16),
  },
  refreshDefaultsButton: {
    width: '100%',
    maxWidth: scale(300),
    minWidth: scale(250),
  },
  buttonTextSmall: {
    fontSize: scale(12),
    lineHeight: scale(16),
  },
});

export default SettingsScreen; 
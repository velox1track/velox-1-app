import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert,
  SafeAreaView,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileH1, MobileH2, MobileBody, MobileCaption } from '../components/Typography';
import { Card } from '../components/Card';
import { ButtonPrimary, ButtonSecondary } from '../components';
import { styleTokens } from '../theme';
import { scale } from '../utils/scale';

const SettingsScreen = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  const [dataStats, setDataStats] = useState({
    athletes: 0,
    teams: 0,
    eventSequence: 0,
    eventResults: 0
  });

  // Load data stats on component mount
  useEffect(() => {
    loadDataStats();
  }, []);

  const loadDataStats = async () => {
    try {
      const athletes = await AsyncStorage.getItem('athletes');
      const teams = await AsyncStorage.getItem('teams');
      const eventSequence = await AsyncStorage.getItem('eventSequence');
      const eventResults = await AsyncStorage.getItem('eventResults');
      
      setDataStats({
        athletes: athletes ? JSON.parse(athletes).length : 0,
        teams: teams ? JSON.parse(teams).length : 0,
        eventSequence: eventSequence ? JSON.parse(eventSequence).length : 0,
        eventResults: eventResults ? JSON.parse(eventResults).length : 0
      });
    } catch (error) {
      console.log('Error loading data stats:', error);
    }
  };

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
        {/* App Info Section */}
        <Card style={[
          styles.section,
          isLandscape && styles.sectionLandscape
        ]}>
          <MobileH2 style={styles.sectionTitle}>App Information</MobileH2>
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

        {/* Data Statistics Section */}
        <Card style={[
          styles.section,
          isLandscape && styles.sectionLandscape
        ]}>
          <MobileH2 style={styles.sectionTitle}>Data Statistics</MobileH2>
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
          <MobileH2 style={styles.sectionTitle}>Data Management</MobileH2>
          
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
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
});

export default SettingsScreen; 
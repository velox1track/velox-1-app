import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert,
  SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileH1, MobileH2, MobileBody, MobileCaption } from '../components/Typography';
import { Card } from '../components/Card';
import { ButtonPrimary, ButtonSecondary } from '../components';
import { styleTokens } from '../theme';
import { scale } from '../utils/scale';

const SettingsScreen = () => {
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
      <ScrollView style={styles.scrollView}>
        {/* App Info Section */}
        <Card style={styles.section}>
          <MobileH2>App Information</MobileH2>
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
        </Card>

        {/* Data Statistics Section */}
        <Card style={styles.section}>
          <MobileH2>Data Statistics</MobileH2>
          <View style={styles.statsGrid}>
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
        <Card style={styles.section}>
          <MobileH2>Data Management</MobileH2>
          
          <View style={styles.buttonGroup}>
            <ButtonSecondary 
              onPress={exportData}
            >
              Export Data
            </ButtonSecondary>
            <ButtonSecondary 
              onPress={resetEventProgress}
            >
              Reset Event Progress
            </ButtonSecondary>
          </View>

          <View style={styles.clearButtonsContainer}>
            <ButtonSecondary 
              onPress={() => clearSpecificData('athletes', 'athletes')}
            >
              Clear Athletes
            </ButtonSecondary>
            <ButtonSecondary 
              onPress={() => clearSpecificData('teams', 'teams')}
            >
              Clear Teams
            </ButtonSecondary>
            <ButtonSecondary 
              onPress={() => clearSpecificData('eventSequence', 'eventSequence')}
            >
              Clear Event Sequence
            </ButtonSecondary>
            <ButtonSecondary 
              onPress={() => clearSpecificData('eventResults', 'eventResults')}
            >
              Clear Event Results
            </ButtonSecondary>
          </View>

          <View style={styles.dangerZone}>
            <MobileH2 style={styles.dangerZoneTitle}>⚠️ Danger Zone</MobileH2>
            <MobileBody style={styles.dangerZoneText}>
              These actions will permanently delete data and cannot be undone.
            </MobileBody>
            <ButtonSecondary 
              onPress={clearAllData}
            >
              Clear All Data
            </ButtonSecondary>
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
    padding: scale(24),
  },
  section: {
    marginBottom: scale(24),
    padding: scale(20),
    minHeight: scale(120),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: styleTokens.colors.border,
  },
  infoLabel: {
    color: styleTokens.colors.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    color: styleTokens.colors.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: scale(16),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: scale(16),
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: scale(80),
  },
  statNumber: {
    color: styleTokens.colors.primary,
    marginBottom: scale(8),
  },
  statLabel: {
    color: styleTokens.colors.textSecondary,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: scale(16),
  },
  clearButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: scale(12),
    marginBottom: scale(16),
  },
  dangerZone: {
    backgroundColor: '#fdf6e3',
    padding: scale(20),
    borderRadius: scale(12),
    marginTop: scale(16),
  },
  dangerZoneTitle: {
    color: '#c0392b',
    marginBottom: scale(12),
    textAlign: 'center',
  },
  dangerZoneText: {
    color: styleTokens.colors.textSecondary,
    marginBottom: scale(16),
    textAlign: 'center',
  },
});

export default SettingsScreen; 
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Name</Text>
            <Text style={styles.infoValue}>Velox 1 Race Roulette</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Description</Text>
            <Text style={styles.infoValue}>Track Competition Organizer</Text>
          </View>
        </View>

        {/* Data Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dataStats.athletes}</Text>
              <Text style={styles.statLabel}>Athletes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dataStats.teams}</Text>
              <Text style={styles.statLabel}>Teams</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dataStats.eventSequence}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dataStats.eventResults}</Text>
              <Text style={styles.statLabel}>Results</Text>
            </View>
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={exportData}
          >
            <Text style={styles.actionButtonText}>Export All Data</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.warningButton]} 
            onPress={resetEventProgress}
          >
            <Text style={styles.actionButtonText}>Reset Event Progress</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <Text style={styles.subsectionTitle}>Clear Specific Data</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={() => clearSpecificData('athletes', 'athletes')}
          >
            <Text style={styles.actionButtonText}>Clear Athletes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={() => clearSpecificData('teams', 'teams')}
          >
            <Text style={styles.actionButtonText}>Clear Teams</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={() => clearSpecificData('eventSequence', 'eventSequence')}
          >
            <Text style={styles.actionButtonText}>Clear Event Sequence</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={() => clearSpecificData('eventResults', 'eventResults')}
          >
            <Text style={styles.actionButtonText}>Clear Event Results</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={clearAllData}
          >
            <Text style={styles.actionButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          
          <View style={styles.helpItem}>
            <Text style={styles.helpTitle}>Getting Started</Text>
            <Text style={styles.helpText}>
              1. Add athletes in Team Builder{'\n'}
              2. Generate event sequence in Race Roulette{'\n'}
              3. Create teams in Assign Teams{'\n'}
              4. Enter results in Scoreboard
            </Text>
          </View>

          <View style={styles.helpItem}>
            <Text style={styles.helpTitle}>Data Persistence</Text>
            <Text style={styles.helpText}>
              All data is stored locally on your device using AsyncStorage. 
              Data persists between app sessions but will be lost if you clear app data or uninstall the app.
            </Text>
          </View>

          <View style={styles.helpItem}>
            <Text style={styles.helpTitle}>Backup Recommendation</Text>
            <Text style={styles.helpText}>
              Use the Export Data feature to create backups of your competition data before clearing or resetting.
            </Text>
          </View>
        </View>
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
  section: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  infoValue: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  warningButton: {
    backgroundColor: '#f39c12',
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 20,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  helpItem: {
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});

export default SettingsScreen; 
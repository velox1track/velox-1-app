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
import AthleteForm from '../components/AthleteForm';
import CSVImporter from '../components/CSVImporter';

const TeamBuilderScreen = () => {
  const [athletes, setAthletes] = useState([]);
  const [showCSVImporter, setShowCSVImporter] = useState(false);

  // Load saved athletes on component mount
  useEffect(() => {
    loadAthletes();
  }, []);

  const loadAthletes = async () => {
    try {
      const savedAthletes = await AsyncStorage.getItem('athletes');
      if (savedAthletes) {
        setAthletes(JSON.parse(savedAthletes));
      }
    } catch (error) {
      console.log('Error loading athletes:', error);
    }
  };

  const saveAthletes = async (newAthletes) => {
    try {
      await AsyncStorage.setItem('athletes', JSON.stringify(newAthletes));
    } catch (error) {
      console.log('Error saving athletes:', error);
    }
  };

  const addAthlete = (athlete) => {
    const newAthletes = [...athletes, athlete];
    setAthletes(newAthletes);
    saveAthletes(newAthletes);
    Alert.alert('Success', `${athlete.name} added successfully!`);
  };

  const importAthletes = (importedAthletes) => {
    const newAthletes = [...athletes, ...importedAthletes];
    setAthletes(newAthletes);
    saveAthletes(newAthletes);
  };

  const deleteAthlete = (athleteId) => {
    Alert.alert(
      'Delete Athlete',
      'Are you sure you want to delete this athlete?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const newAthletes = athletes.filter(a => a.id !== athleteId);
            setAthletes(newAthletes);
            saveAthletes(newAthletes);
          }
        }
      ]
    );
  };

  const clearAllAthletes = () => {
    Alert.alert(
      'Clear All Athletes',
      'Are you sure you want to delete all athletes? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            setAthletes([]);
            saveAthletes([]);
          }
        }
      ]
    );
  };

  const getTierCount = (tier) => {
    return athletes.filter(athlete => athlete.tier === tier).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Athlete Form */}
        <AthleteForm onAddAthlete={addAthlete} />

        {/* CSV Import Toggle */}
        <View style={styles.csvToggleContainer}>
          <TouchableOpacity 
            style={styles.csvToggleButton} 
            onPress={() => setShowCSVImporter(!showCSVImporter)}
          >
            <Text style={styles.csvToggleText}>
              {showCSVImporter ? 'Hide CSV Import' : 'Show CSV Import'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* CSV Importer */}
        {showCSVImporter && (
          <CSVImporter onImportAthletes={importAthletes} />
        )}

        {/* Athletes List */}
        <View style={styles.athletesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Athletes ({athletes.length})</Text>
            {athletes.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={clearAllAthletes}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tier Summary */}
          {athletes.length > 0 && (
            <View style={styles.tierSummary}>
              <View style={styles.tierItem}>
                <View style={[styles.tierBadge, styles.tierHigh]}>
                  <Text style={styles.tierText}>High</Text>
                </View>
                <Text style={styles.tierCount}>{getTierCount('High')}</Text>
              </View>
              <View style={styles.tierItem}>
                <View style={[styles.tierBadge, styles.tierMed]}>
                  <Text style={styles.tierText}>Med</Text>
                </View>
                <Text style={styles.tierCount}>{getTierCount('Med')}</Text>
              </View>
              <View style={styles.tierItem}>
                <View style={[styles.tierBadge, styles.tierLow]}>
                  <Text style={styles.tierText}>Low</Text>
                </View>
                <Text style={styles.tierCount}>{getTierCount('Low')}</Text>
              </View>
            </View>
          )}

          {/* Athletes List */}
          {athletes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No athletes added yet</Text>
              <Text style={styles.emptySubtext}>
                Use the form above or CSV import to add athletes
              </Text>
            </View>
          ) : (
            <View style={styles.athletesList}>
              {athletes.map((athlete) => (
                <View key={athlete.id} style={styles.athleteCard}>
                  <View style={styles.athleteInfo}>
                    <Text style={styles.athleteName}>{athlete.name}</Text>
                    <View style={[styles.tierBadge, styles[`tier${athlete.tier}`]]}>
                      <Text style={styles.tierText}>{athlete.tier}</Text>
                    </View>
                  </View>
                  
                  {athlete.bestEvents && (
                    <Text style={styles.bestEvents}>{athlete.bestEvents}</Text>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => deleteAthlete(athlete.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
  csvToggleContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  csvToggleButton: {
    backgroundColor: '#9b59b6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  csvToggleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  athletesSection: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tierSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  tierItem: {
    alignItems: 'center',
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
    marginBottom: 4,
  },
  tierHigh: {
    backgroundColor: '#e74c3c',
  },
  tierMed: {
    backgroundColor: '#f39c12',
  },
  tierLow: {
    backgroundColor: '#27ae60',
  },
  tierText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tierCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
    lineHeight: 20,
  },
  athletesList: {
    gap: 12,
  },
  athleteCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  athleteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  athleteName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  bestEvents: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TeamBuilderScreen; 
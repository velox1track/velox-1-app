import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert,
  SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AthleteForm from '../components/AthleteForm';
import CSVImporter from '../components/CSVImporter';
import { MobileH1, MobileH2, MobileBody, MobileCaption } from '../components/Typography';
import { Card } from '../components/Card';
import { ButtonPrimary, ButtonSecondary } from '../components';
import { styleTokens } from '../theme';
import { scale } from '../utils/scale';

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
          <ButtonSecondary 
            onPress={() => setShowCSVImporter(!showCSVImporter)}
          >
            {showCSVImporter ? 'Hide CSV Import' : 'Show CSV Import'}
          </ButtonSecondary>
        </View>

        {/* CSV Importer */}
        {showCSVImporter && (
          <CSVImporter onImportAthletes={importAthletes} />
        )}

        {/* Athletes List */}
        <Card style={styles.athletesSection}>
          <View style={styles.sectionHeader}>
            <MobileH2>Athletes ({athletes.length})</MobileH2>
            {athletes.length > 0 && (
              <ButtonSecondary 
                onPress={clearAllAthletes}
              >
                Clear All
              </ButtonSecondary>
            )}
          </View>

          {/* Tier Summary */}
          {athletes.length > 0 && (
            <View style={styles.tierSummary}>
              <View style={styles.tierItem}>
                <View style={[styles.tierBadge, styles.tierHigh]}>
                  <MobileCaption>High</MobileCaption>
                </View>
                <MobileBody>{getTierCount('High')}</MobileBody>
              </View>
              <View style={styles.tierItem}>
                <View style={[styles.tierBadge, styles.tierMed]}>
                  <MobileCaption>Med</MobileCaption>
                </View>
                <MobileBody>{getTierCount('Med')}</MobileBody>
              </View>
              <View style={styles.tierItem}>
                <View style={[styles.tierBadge, styles.tierLow]}>
                  <MobileCaption>Low</MobileCaption>
                </View>
                <MobileBody>{getTierCount('Low')}</MobileBody>
              </View>
            </View>
          )}

          {/* Athletes List */}
          {athletes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MobileH1>No athletes added yet</MobileH1>
              <MobileBody>
                Use the form above or CSV import to add athletes
              </MobileBody>
            </View>
          ) : (
            <View style={styles.athletesList}>
              {athletes.map((athlete) => (
                <View key={athlete.id} style={styles.athleteCard}>
                  <View style={styles.athleteInfo}>
                    <MobileH2>{athlete.name}</MobileH2>
                    <View style={[styles.tierBadge, styles[`tier${athlete.tier}`]]}>
                      <MobileCaption>{athlete.tier}</MobileCaption>
                    </View>
                  </View>
                  
                  {athlete.bestEvents && (
                    <MobileCaption>{athlete.bestEvents}</MobileCaption>
                  )}
                  
                  <ButtonSecondary 
                    onPress={() => deleteAthlete(athlete.id)}
                  >
                    Delete
                  </ButtonSecondary>
                </View>
              ))}
            </View>
          )}
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
  csvToggleContainer: {
    alignItems: 'center',
    marginVertical: scale(16),
  },
  athletesSection: {
    margin: scale(16),
    padding: scale(20),
    borderRadius: scale(12),
    shadowColor: styleTokens.colors.shadow,
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
    marginBottom: scale(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  clearButton: {
    backgroundColor: styleTokens.colors.danger,
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(6),
  },
  clearButtonText: {
    color: styleTokens.colors.white,
    fontSize: scale(14),
    fontWeight: 'bold',
  },
  tierSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: scale(20),
    padding: scale(16),
    backgroundColor: styleTokens.colors.surface,
    borderRadius: scale(8),
  },
  tierItem: {
    alignItems: 'center',
  },
  tierBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(12),
    minWidth: scale(60),
    alignItems: 'center',
    marginBottom: scale(4),
  },
  tierHigh: {
    backgroundColor: styleTokens.colors.danger,
  },
  tierMed: {
    backgroundColor: styleTokens.colors.warning,
  },
  tierLow: {
    backgroundColor: styleTokens.colors.success,
  },
  tierText: {
    color: styleTokens.colors.white,
    fontSize: scale(12),
    fontWeight: 'bold',
  },
  tierCount: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: styleTokens.colors.textPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: scale(40),
  },
  emptyText: {
    fontSize: scale(18),
    color: styleTokens.colors.textSecondary,
    marginBottom: scale(8),
  },
  emptySubtext: {
    fontSize: scale(14),
    color: styleTokens.colors.textSecondary,
    textAlign: 'center',
    lineHeight: scale(20),
    opacity: 0.7,
  },
  athletesList: {
    gap: scale(12),
  },
  athleteCard: {
    backgroundColor: styleTokens.colors.surface,
    padding: scale(16),
    borderRadius: scale(8),
    borderLeftWidth: scale(4),
    borderLeftColor: styleTokens.colors.primary,
  },
  athleteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  athleteName: {
    fontSize: scale(18),
    fontWeight: '600',
    color: styleTokens.colors.textPrimary,
    flex: 1,
  },
  bestEvents: {
    fontSize: scale(14),
    color: styleTokens.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: scale(12),
  },
  deleteButton: {
    backgroundColor: styleTokens.colors.danger,
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(6),
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: styleTokens.colors.white,
    fontSize: scale(14),
    fontWeight: 'bold',
  },
});

export default TeamBuilderScreen; 
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TeamList from '../components/TeamList';
import { assignTeams, moveAthlete } from '../lib/assigner';

const AssignTeamsScreen = () => {
  const [athletes, setAthletes] = useState([]);
  const [teams, setTeams] = useState([]);
  const [numTeams, setNumTeams] = useState('4');
  const [showTeamSize, setShowTeamSize] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedAthletes = await AsyncStorage.getItem('athletes');
      const savedTeams = await AsyncStorage.getItem('teams');
      
      if (savedAthletes) {
        setAthletes(JSON.parse(savedAthletes));
      }
      if (savedTeams) {
        setTeams(JSON.parse(savedTeams));
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const saveTeams = async (newTeams) => {
    try {
      await AsyncStorage.setItem('teams', JSON.stringify(newTeams));
    } catch (error) {
      console.log('Error saving teams:', error);
    }
  };

  const generateTeams = () => {
    if (athletes.length === 0) {
      Alert.alert('No Athletes', 'Please add athletes first in the Team Builder screen.');
      return;
    }

    const num = parseInt(numTeams);
    if (num < 1) {
      Alert.alert('Invalid Input', 'Number of teams must be at least 1.');
      return;
    }

    if (num > athletes.length) {
      Alert.alert('Too Many Teams', `Cannot create ${num} teams with only ${athletes.length} athletes.`);
      return;
    }

    const result = assignTeams(athletes, num);
    
    if (result.success) {
      setTeams(result.teams);
      saveTeams(result.teams);
      
      Alert.alert(
        'Teams Generated!', 
        `Created ${result.teams.length} teams with ${result.stats.totalAthletes} athletes.\n\n` +
        `High Tier: ${result.stats.highTier}\n` +
        `Medium Tier: ${result.stats.medTier}\n` +
        `Low Tier: ${result.stats.lowTier}\n\n` +
        `Average team size: ${result.stats.averageTeamSize}`
      );
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleMoveAthlete = (athleteId, fromTeamId, toTeamId) => {
    const result = moveAthlete([...teams], athleteId, fromTeamId, toTeamId);
    
    if (result.success) {
      setTeams(result.teams);
      saveTeams(result.teams);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const resetTeams = () => {
    Alert.alert(
      'Reset Teams',
      'Are you sure you want to reset all teams? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setTeams([]);
            saveTeams([]);
          }
        }
      ]
    );
  };

  const getTeamSize = () => {
    if (athletes.length === 0 || teams.length === 0) return 0;
    return Math.ceil(athletes.length / teams.length);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Controls Section */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Generate Teams</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Number of Teams</Text>
              <TextInput
                style={styles.input}
                value={numTeams}
                onChangeText={setNumTeams}
                keyboardType="numeric"
                placeholder="4"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Team Size</Text>
              <Text style={styles.teamSizeText}>
                ~{getTeamSize()} athletes
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoText}>
              Available Athletes: {athletes.length}
            </Text>
            <Text style={styles.infoText}>
              Current Teams: {teams.length}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.generateButton} 
            onPress={generateTeams}
            disabled={athletes.length === 0}
          >
            <Text style={styles.buttonText}>Generate Teams</Text>
          </TouchableOpacity>

          {teams.length > 0 && (
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetTeams}
            >
              <Text style={styles.resetButtonText}>Reset Teams</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Teams Display */}
        {teams.length > 0 && (
          <View style={styles.teamsSection}>
            <Text style={styles.sectionTitle}>Team Assignments</Text>
            <TeamList teams={teams} onMoveAthlete={handleMoveAthlete} />
          </View>
        )}

        {/* Instructions */}
        {teams.length === 0 && (
          <View style={styles.instructionsSection}>
            <Text style={styles.instructionsTitle}>How Team Assignment Works</Text>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>
                Add athletes in the Team Builder screen with their tier (High/Med/Low)
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>
                Choose the number of teams you want to create
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>
                Click "Generate Teams" to automatically assign athletes using tier-balanced distribution
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>
                Athletes are distributed in round-robin fashion: High → Med → Low
              </Text>
            </View>
          </View>
        )}

        {/* Athlete Summary */}
        {athletes.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Athlete Summary</Text>
            <View style={styles.tierBreakdown}>
              <View style={styles.tierRow}>
                <View style={[styles.tierBadge, styles.tierHigh]}>
                  <Text style={styles.tierText}>High</Text>
                </View>
                <Text style={styles.tierCount}>
                  {athletes.filter(a => a.tier === 'High').length} athletes
                </Text>
              </View>
              <View style={styles.tierRow}>
                <View style={[styles.tierBadge, styles.tierMed]}>
                  <Text style={styles.tierText}>Med</Text>
                </View>
                <Text style={styles.tierCount}>
                  {athletes.filter(a => a.tier === 'Med').length} athletes
                </Text>
              </View>
              <View style={styles.tierRow}>
                <View style={[styles.tierBadge, styles.tierLow]}>
                  <Text style={styles.tierText}>Low</Text>
                </View>
                <Text style={styles.tierCount}>
                  {athletes.filter(a => a.tier === 'Low').length} athletes
                </Text>
              </View>
            </View>
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
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
  },
  teamSizeText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamsSection: {
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
  instructionsSection: {
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
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    backgroundColor: '#3498db',
    color: '#ffffff',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 2,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  summarySection: {
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
  tierBreakdown: {
    gap: 12,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
    marginRight: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
});

export default AssignTeamsScreen; 
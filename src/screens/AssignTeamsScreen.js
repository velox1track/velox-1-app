import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Alert,
  SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TeamList from '../components/TeamList';
import { assignTeams, moveAthlete } from '../lib/assigner';
import { MobileH1, MobileH2, MobileBody, MobileCaption } from '../components/Typography';
import { Card } from '../components/Card';
import { ButtonPrimary, ButtonSecondary } from '../components';
import { styleTokens } from '../theme';
import { scale } from '../utils/scale';

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
        <Card style={styles.controlsSection}>
          <MobileH1>Generate Teams</MobileH1>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <MobileBody>Number of Teams</MobileBody>
              <TextInput
                style={styles.input}
                value={numTeams}
                onChangeText={setNumTeams}
                keyboardType="numeric"
                placeholder="4"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <MobileBody>Team Size</MobileBody>
              <MobileCaption>
                ~{getTeamSize()} athletes
              </MobileCaption>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MobileBody>
              Available Athletes: {athletes.length}
            </MobileBody>
            <MobileBody>
              Current Teams: {teams.length}
            </MobileBody>
          </View>

          <ButtonPrimary 
            onPress={generateTeams}
            disabled={athletes.length === 0}
          >
            Generate Teams
          </ButtonPrimary>

          {teams.length > 0 && (
            <ButtonSecondary 
              onPress={resetTeams}
            >
              Reset Teams
            </ButtonSecondary>
          )}
        </Card>

        {/* Teams Display */}
        {teams.length > 0 && (
          <Card style={styles.teamsSection}>
            <MobileH2>Team Assignments</MobileH2>
            <TeamList teams={teams} onMoveAthlete={handleMoveAthlete} />
          </Card>
        )}

        {/* Instructions */}
        {teams.length === 0 && (
          <Card style={styles.instructionsSection}>
            <MobileH2>How Team Assignment Works</MobileH2>
            <View style={styles.instructionItem}>
              <MobileCaption style={styles.instructionNumber}>1</MobileCaption>
              <MobileBody style={styles.instructionText}>
                Add athletes in the Team Builder screen with their tier (High/Med/Low)
              </MobileBody>
            </View>
            <View style={styles.instructionItem}>
              <MobileCaption style={styles.instructionNumber}>2</MobileCaption>
              <MobileBody style={styles.instructionText}>
                Choose the number of teams you want to create
              </MobileBody>
            </View>
            <View style={styles.instructionItem}>
              <MobileCaption style={styles.instructionNumber}>3</MobileCaption>
              <MobileBody style={styles.instructionText}>
                Click "Generate Teams" to automatically assign athletes using tier-balanced distribution
              </MobileBody>
            </View>
            <View style={styles.instructionItem}>
              <MobileCaption style={styles.instructionNumber}>4</MobileCaption>
              <MobileBody style={styles.instructionText}>
                Athletes are distributed in round-robin fashion: High → Med → Low
              </MobileBody>
            </View>
          </Card>
        )}

        {/* Athlete Summary */}
        {athletes.length > 0 && (
          <Card style={styles.summarySection}>
            <MobileH2>Athlete Summary</MobileH2>
            <View style={styles.tierBreakdown}>
              <View style={styles.tierRow}>
                <View style={[styles.tierBadge, styles.tierHigh]}>
                  <MobileCaption style={styles.tierText}>High</MobileCaption>
                </View>
                <MobileBody style={styles.tierCount}>
                  {athletes.filter(a => a.tier === 'High').length} athletes
                </MobileBody>
              </View>
              <View style={styles.tierRow}>
                <View style={[styles.tierBadge, styles.tierMed]}>
                  <MobileCaption style={styles.tierText}>Med</MobileCaption>
                </View>
                <MobileBody style={styles.tierCount}>
                  {athletes.filter(a => a.tier === 'Med').length} athletes
                </MobileBody>
              </View>
              <View style={styles.tierRow}>
                <View style={[styles.tierBadge, styles.tierLow]}>
                  <MobileCaption style={styles.tierText}>Low</MobileCaption>
                </View>
                <MobileBody style={styles.tierCount}>
                  {athletes.filter(a => a.tier === 'Low').length} athletes
                </MobileBody>
              </View>
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
  },
  controlsSection: {
    margin: scale(16),
    padding: scale(20),
    minHeight: scale(120),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: scale(12),
    marginBottom: scale(16),
  },
  inputGroup: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: styleTokens.colors.border,
    borderRadius: scale(8),
    padding: scale(12),
    fontSize: scale(16),
    color: styleTokens.colors.textPrimary,
    backgroundColor: styleTokens.colors.surface,
  },
  teamSizeText: {
    fontSize: 16,
    color: styleTokens.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: scale(12),
    backgroundColor: styleTokens.colors.surface,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: styleTokens.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(16),
  },
  infoText: {
    fontSize: 14,
    color: styleTokens.colors.textSecondary,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: styleTokens.colors.success,
    padding: scale(16),
    borderRadius: scale(8),
    alignItems: 'center',
    marginBottom: scale(12),
  },
  buttonText: {
    color: styleTokens.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: styleTokens.colors.danger,
    padding: scale(12),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  resetButtonText: {
    color: styleTokens.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamsSection: {
    margin: scale(16),
    padding: scale(20),
    minHeight: scale(120),
  },
  instructionsSection: {
    margin: scale(16),
    padding: scale(20),
    minHeight: scale(120),
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
    marginBottom: scale(12),
  },
  instructionNumber: {
    backgroundColor: styleTokens.colors.primary,
    color: styleTokens.colors.white,
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    textAlign: 'center',
    lineHeight: scale(24),
    fontSize: scale(14),
    fontWeight: 'bold',
    marginRight: scale(12),
    marginTop: scale(2),
  },
  instructionText: {
    color: styleTokens.colors.textSecondary,
    flex: 1,
    lineHeight: scale(20),
  },
  summarySection: {
    margin: scale(16),
    padding: scale(20),
    minHeight: scale(120),
  },
  tierBreakdown: {
    gap: scale(12),
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
    backgroundColor: styleTokens.colors.surface,
    borderRadius: scale(8),
  },
  tierBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(12),
    minWidth: scale(60),
    alignItems: 'center',
    marginRight: scale(16),
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
    fontSize: scale(16),
    fontWeight: '600',
    color: styleTokens.colors.textPrimary,
  },
});

export default AssignTeamsScreen; 
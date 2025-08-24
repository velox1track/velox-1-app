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
import { MobileH1, MobileH2, MobileBody, MobileCaption } from '../components/Typography';
import { Card } from '../components/Card';
import { ButtonPrimary, ButtonSecondary } from '../components';
import { styleTokens } from '../theme';
import { scale } from '../utils/scale';

const ScoreboardScreen = () => {
  const [teams, setTeams] = useState([]);
  const [eventSequence, setEventSequence] = useState([]);
  const [revealedIndex, setRevealedIndex] = useState(0);
  const [eventResults, setEventResults] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showResultForm, setShowResultForm] = useState(false);

  // Basic scoring table (can be enhanced later)
  const scoringTable = {
    1: 10, 2: 8, 3: 6, 4: 4, 5: 2, 6: 1
  };

  // Load saved data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedTeams = await AsyncStorage.getItem('teams');
      const savedEventSequence = await AsyncStorage.getItem('eventSequence');
      const savedRevealedIndex = await AsyncStorage.getItem('revealedIndex');
      const savedEventResults = await AsyncStorage.getItem('eventResults');
      
      if (savedTeams) {
        setTeams(JSON.parse(savedTeams));
      }
      if (savedEventSequence) {
        setEventSequence(JSON.parse(savedEventSequence));
      }
      if (savedRevealedIndex) {
        setRevealedIndex(parseInt(savedRevealedIndex));
      }
      if (savedEventResults) {
        setEventResults(JSON.parse(savedEventResults));
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const saveEventResults = async (newResults) => {
    try {
      await AsyncStorage.setItem('eventResults', JSON.stringify(newResults));
    } catch (error) {
      console.log('Error saving event results:', error);
    }
  };

  const calculateTeamScores = () => {
    if (!teams.length || !eventResults.length) return [];

    return teams.map(team => {
      let totalScore = 0;
      let eventCount = 0;

      eventResults.forEach(result => {
        const placement = result.placements.find(p => p.teamId === team.id);
        if (placement) {
          totalScore += scoringTable[placement.place] || 0;
          eventCount++;
        }
      });

      return {
        ...team,
        totalScore,
        eventCount,
        averageScore: eventCount > 0 ? (totalScore / eventCount).toFixed(1) : 0
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  };

  const handleEventSelection = (event, eventIndex) => {
    if (eventIndex >= revealedIndex) {
      Alert.alert('Event Not Revealed', 'This event has not been revealed yet.');
      return;
    }

    // Check if result already exists
    const existingResult = eventResults.find(r => r.eventIndex === eventIndex);
    if (existingResult) {
      Alert.alert('Result Already Entered', 'This event already has results entered.');
      return;
    }

    setSelectedEvent({ event, eventIndex });
    setShowResultForm(true);
  };

  const submitEventResult = (placements) => {
    if (!selectedEvent) return;

    const newResult = {
      eventIndex: selectedEvent.eventIndex,
      event: selectedEvent.event,
      placements: placements,
      timestamp: new Date().toISOString()
    };

    const newResults = [...eventResults, newResult];
    setEventResults(newResults);
    saveEventResults(newResults);
    
    setShowResultForm(false);
    setSelectedEvent(null);
    
    Alert.alert('Success', 'Event result submitted successfully!');
  };

  const resetAllResults = () => {
    Alert.alert(
      'Reset All Results',
      'Are you sure you want to clear all event results? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset All', 
          style: 'destructive',
          onPress: () => {
            setEventResults([]);
            saveEventResults([]);
          }
        }
      ]
    );
  };

  const getEventStatus = (eventIndex) => {
    if (eventIndex >= revealedIndex) {
      return 'not-revealed';
    }
    
    const hasResult = eventResults.find(r => r.eventIndex === eventIndex);
    return hasResult ? 'completed' : 'pending';
  };

  const getEventStatusColor = (status) => {
    switch (status) {
      case 'completed': return styleTokens.colors.success;
      case 'pending': return styleTokens.colors.warning;
      case 'not-revealed': return styleTokens.colors.disabled;
      default: return styleTokens.colors.disabled;
    }
  };

  const getEventStatusText = (status) => {
    switch (status) {
      case 'completed': return '✓ Completed';
      case 'pending': return '⏳ Pending';
      case 'not-revealed': return '🔒 Locked';
      default: return 'Unknown';
    }
  };

  const teamScores = calculateTeamScores();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Team Scores Section */}
        <Card style={styles.scoresSection}>
          <View style={styles.sectionHeader}>
            <MobileH2>Team Scores</MobileH2>
            {eventResults.length > 0 && (
              <ButtonSecondary 
                onPress={resetAllResults}
              >
                Reset All
              </ButtonSecondary>
            )}
          </View>

          {teamScores.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MobileH1>No teams or results yet</MobileH1>
              <MobileBody>
                Create teams and enter event results to see scores
              </MobileBody>
            </View>
          ) : (
            <View style={styles.scoreboard}>
              {teamScores.map((team, index) => (
                <View key={team.id} style={styles.teamScoreRow}>
                  <View style={styles.teamInfo}>
                    <View style={styles.rankBadge}>
                      <MobileCaption style={styles.rankText}>#{index + 1}</MobileCaption>
                    </View>
                    <View style={styles.teamDetails}>
                      <MobileH2 style={styles.teamName}>{team.name}</MobileH2>
                      <MobileCaption style={styles.teamStats}>
                        {team.eventCount} events • {team.athletes.length} athletes
                      </MobileCaption>
                    </View>
                  </View>
                  <View style={styles.scoreInfo}>
                    <MobileH2 style={styles.totalScore}>{team.totalScore}</MobileH2>
                    <MobileCaption style={styles.averageScore}>
                      Avg: {team.averageScore}
                    </MobileCaption>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Event Sequence Section */}
        {eventSequence.length > 0 && (
          <Card style={styles.eventsSection}>
            <View style={styles.sectionHeader}>
              <MobileH2>Event Sequence</MobileH2>
              <MobileCaption style={styles.eventsSubtitle}>
                {revealedIndex} of {eventSequence.length} events revealed
              </MobileCaption>
            </View>
            
            <View style={styles.eventsList}>
              {eventSequence.map((event, index) => {
                const status = getEventStatus(index);
                const statusColor = getEventStatusColor(status);
                const statusText = getEventStatusText(status);
                
                return (
                  <View key={index} style={styles.eventRow}>
                    <View style={styles.eventInfo}>
                      <MobileH2 style={styles.eventNumber}>#{index + 1}</MobileH2>
                      <MobileBody style={styles.eventName}>{event}</MobileBody>
                    </View>
                    
                    <View style={styles.eventStatus}>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <MobileCaption style={styles.statusText}>{statusText}</MobileCaption>
                      </View>
                      
                      {status === 'pending' && (
                        <ButtonSecondary 
                          onPress={() => handleEventSelection(event, index)}
                        >
                          Enter Result
                        </ButtonSecondary>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        {/* Instructions */}
        {eventSequence.length === 0 && (
          <Card style={styles.instructionsSection}>
            <MobileH2>How Scoring Works</MobileH2>
            <View style={styles.instructionItem}>
              <MobileCaption style={styles.instructionNumber}>1</MobileCaption>
              <MobileBody style={styles.instructionText}>
                Generate an event sequence in Race Roulette
              </MobileBody>
            </View>
            <View style={styles.instructionItem}>
              <MobileCaption style={styles.instructionNumber}>2</MobileCaption>
              <MobileBody style={styles.instructionText}>
                Create teams and assign athletes in Assign Teams
              </MobileBody>
            </View>
            <View style={styles.instructionItem}>
              <MobileCaption style={styles.instructionNumber}>3</MobileCaption>
              <MobileBody style={styles.instructionText}>
                Enter results for each completed event
              </MobileBody>
            </View>
            <View style={styles.instructionItem}>
              <MobileCaption style={styles.instructionNumber}>4</MobileCaption>
              <MobileBody style={styles.instructionText}>
                View real-time team rankings and scores
              </MobileBody>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Event Result Form Component
const EventResultForm = ({ event, teams, onSubmit, onCancel }) => {
  const [placements, setPlacements] = useState([]);

  useEffect(() => {
    // Initialize placements for all teams
    const initialPlacements = teams.map(team => ({
      teamId: team.id,
      teamName: team.name,
      place: ''
    }));
    setPlacements(initialPlacements);
  }, [teams]);

  const handlePlacementChange = (teamId, value) => {
    const newPlacements = placements.map(p => 
      p.teamId === teamId ? { ...p, place: value } : p
    );
    setPlacements(newPlacements);
  };

  const handleSubmit = () => {
    // Validate placements
    const validPlacements = placements.filter(p => p.place !== '');
    const places = validPlacements.map(p => parseInt(p.place));
    
    if (validPlacements.length === 0) {
      Alert.alert('Error', 'Please enter at least one placement.');
      return;
    }
    
    if (new Set(places).size !== places.length) {
      Alert.alert('Error', 'Each placement must be unique.');
      return;
    }
    
    if (Math.min(...places) < 1) {
      Alert.alert('Error', 'Placements must start from 1.');
      return;
    }
    
    onSubmit(validPlacements);
  };

  return (
    <Card style={styles.resultFormContainer}>
      <MobileH2 style={styles.formTitle}>Enter Results: {event.event}</MobileH2>
      
      <View style={styles.placementsList}>
        {placements.map((placement) => (
          <View key={placement.teamId} style={styles.placementRow}>
            <MobileBody style={styles.teamName}>{placement.teamName}</MobileBody>
            <TextInput
              style={styles.placementInput}
              value={placement.place}
              onChangeText={(value) => handlePlacementChange(placement.teamId, value)}
              placeholder="Place"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
        ))}
      </View>

      <View style={styles.formButtons}>
        <ButtonSecondary onPress={onCancel}>
          Cancel
        </ButtonSecondary>
        <ButtonPrimary onPress={handleSubmit}>
          Submit Results
        </ButtonPrimary>
      </View>
    </Card>
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
  scoresSection: {
    marginBottom: scale(24),
    padding: scale(20),
    minHeight: scale(120),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(20),
  },
  emptyContainer: {
    alignItems: 'center',
    padding: scale(40),
  },
  emptyText: {
    color: styleTokens.colors.textSecondary,
    marginBottom: scale(8),
    textAlign: 'center',
  },
  emptySubtext: {
    color: styleTokens.colors.textSecondary,
    textAlign: 'center',
    opacity: 0.7,
  },
  scoreboard: {
    gap: scale(16),
  },
  teamScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    backgroundColor: styleTokens.colors.surface,
    borderRadius: styleTokens.components.card.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    backgroundColor: styleTokens.colors.primary,
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(16),
  },
  rankText: {
    color: styleTokens.colors.white,
    fontWeight: 'bold',
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    color: styleTokens.colors.textPrimary,
    marginBottom: scale(4),
  },
  teamStats: {
    color: styleTokens.colors.textSecondary,
    opacity: 0.7,
  },
  scoreInfo: {
    alignItems: 'flex-end',
  },
  totalScore: {
    color: styleTokens.colors.textPrimary,
    marginBottom: scale(4),
  },
  averageScore: {
    color: styleTokens.colors.textSecondary,
    opacity: 0.7,
  },
  eventsSection: {
    marginBottom: scale(24),
    padding: scale(20),
    minHeight: scale(120),
  },
  eventsSubtitle: {
    color: styleTokens.colors.textSecondary,
    opacity: 0.7,
  },
  eventsList: {
    gap: scale(16),
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    backgroundColor: styleTokens.colors.surface,
    borderRadius: styleTokens.components.card.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventNumber: {
    color: styleTokens.colors.primary,
    marginRight: scale(16),
    minWidth: scale(40),
  },
  eventName: {
    color: styleTokens.colors.textPrimary,
    flex: 1,
  },
  eventStatus: {
    alignItems: 'flex-end',
    gap: scale(8),
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(12),
    minWidth: scale(80),
    alignItems: 'center',
  },
  statusText: {
    color: styleTokens.colors.white,
    fontWeight: 'bold',
  },
  resultFormContainer: {
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
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  placementsList: {
    gap: 12,
    marginBottom: 20,
  },
  placementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  placementInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#ffffff',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default ScoreboardScreen; 
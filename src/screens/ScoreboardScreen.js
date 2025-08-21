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
      case 'completed': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'not-revealed': return '#bdc3c7';
      default: return '#bdc3c7';
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
        <View style={styles.scoresSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Team Scores</Text>
            {eventResults.length > 0 && (
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={resetAllResults}
              >
                <Text style={styles.resetButtonText}>Reset All</Text>
              </TouchableOpacity>
            )}
          </View>

          {teamScores.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No teams or results yet</Text>
              <Text style={styles.emptySubtext}>
                Create teams and enter event results to see scores
              </Text>
            </View>
          ) : (
            <View style={styles.scoreboard}>
              {teamScores.map((team, index) => (
                <View key={team.id} style={styles.scoreRow}>
                  <View style={styles.rankColumn}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.teamColumn}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamStats}>
                      {team.athletes.length} athletes • {team.eventCount} events
                    </Text>
                  </View>
                  <View style={styles.scoreColumn}>
                    <Text style={styles.totalScore}>{team.totalScore}</Text>
                    <Text style={styles.averageScore}>
                      Avg: {team.averageScore}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Event Results Section */}
        {eventSequence.length > 0 && (
          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Event Results</Text>
            
            <View style={styles.eventsList}>
              {eventSequence.map((event, index) => {
                const status = getEventStatus(index);
                const statusColor = getEventStatusColor(status);
                const statusText = getEventStatusText(status);
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.eventItem,
                      { borderLeftColor: statusColor }
                    ]}
                    onPress={() => handleEventSelection(event, index)}
                    disabled={status === 'not-revealed'}
                  >
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventNumber}>#{index + 1}</Text>
                      <Text style={styles.eventName}>{event}</Text>
                    </View>
                    <View style={styles.eventStatus}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {statusText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Result Entry Form */}
        {showResultForm && selectedEvent && (
          <EventResultForm
            event={selectedEvent}
            teams={teams}
            onSubmit={submitEventResult}
            onCancel={() => {
              setShowResultForm(false);
              setSelectedEvent(null);
            }}
          />
        )}

        {/* Instructions */}
        {eventSequence.length === 0 && (
          <View style={styles.instructionsSection}>
            <Text style={styles.instructionsTitle}>How Scoring Works</Text>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>
                Generate an event sequence in the Race Roulette screen
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>
                Create teams in the Assign Teams screen
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>
                Enter results for completed events to see team scores
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>
                Scoring: 1st=10pts, 2nd=8pts, 3rd=6pts, 4th=4pts, 5th=2pts, 6th=1pt
              </Text>
            </View>
          </View>
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
    <View style={styles.resultFormContainer}>
      <Text style={styles.formTitle}>Enter Results: {event.event}</Text>
      
      <View style={styles.placementsList}>
        {placements.map((placement) => (
          <View key={placement.teamId} style={styles.placementRow}>
            <Text style={styles.teamName}>{placement.teamName}</Text>
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
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Results</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  scoresSection: {
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
  resetButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
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
  scoreboard: {
    gap: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  rankColumn: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  teamColumn: {
    flex: 1,
    marginLeft: 16,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  teamStats: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  scoreColumn: {
    alignItems: 'flex-end',
  },
  totalScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  averageScore: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  eventsSection: {
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
  eventsList: {
    gap: 8,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginRight: 12,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  eventStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
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
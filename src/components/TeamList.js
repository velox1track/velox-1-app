import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const TeamList = ({ teams, onMoveAthlete }) => {
  if (!teams || teams.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No teams created yet</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {teams.map((team) => (
        <View key={team.id} style={styles.teamCard}>
          <View style={styles.teamHeader}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamSize}>{team.athletes.length} athletes</Text>
          </View>
          
          {team.athletes.length === 0 ? (
            <Text style={styles.noAthletes}>No athletes assigned</Text>
          ) : (
            <View style={styles.athletesList}>
              {team.athletes.map((athlete, index) => (
                <View key={athlete.id} style={styles.athleteItem}>
                  <View style={styles.athleteInfo}>
                    <Text style={styles.athleteName}>{athlete.name}</Text>
                    <View style={[styles.tierBadge, styles[`tier${athlete.tier}`]]}>
                      <Text style={styles.tierText}>{athlete.tier}</Text>
                    </View>
                  </View>
                  {athlete.bestEvents && (
                    <Text style={styles.bestEvents}>{athlete.bestEvents}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  teamCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  teamSize: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  noAthletes: {
    textAlign: 'center',
    color: '#bdc3c7',
    fontStyle: 'italic',
    padding: 20,
  },
  athletesList: {
    gap: 8,
  },
  athleteItem: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  athleteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  athleteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
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
  bestEvents: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default TeamList; 
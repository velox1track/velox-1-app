import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EventCard = ({ event, index, isRevealed, isNext }) => {
  return (
    <View style={[
      styles.card,
      isRevealed ? styles.revealed : styles.hidden,
      isNext ? styles.nextEvent : null
    ]}>
      <Text style={styles.index}>#{index + 1}</Text>
      <Text style={[
        styles.eventName,
        isRevealed ? styles.revealedText : styles.hiddenText
      ]}>
        {isRevealed ? event : '???'}
      </Text>
      {isNext && !isRevealed && (
        <Text style={styles.nextIndicator}>Next Event</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    backgroundColor: '#34495e',
    borderColor: '#2c3e50',
  },
  revealed: {
    backgroundColor: '#27ae60',
    borderColor: '#229954',
  },
  nextEvent: {
    borderColor: '#f39c12',
    borderWidth: 3,
  },
  index: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 4,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hiddenText: {
    color: '#bdc3c7',
  },
  revealedText: {
    color: '#ffffff',
  },
  nextIndicator: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default EventCard; 
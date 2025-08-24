import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const AthleteForm = ({ onAddAthlete }) => {
  const [name, setName] = useState('');
  const [tier, setTier] = useState('Med');
  const [bestEvents, setBestEvents] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an athlete name');
      return;
    }

    const athlete = {
      id: Date.now().toString(), // Simple ID generation
      name: name.trim(),
      tier: tier,
      bestEvents: bestEvents.trim() || null,
    };

    onAddAthlete(athlete);
    
    // Reset form
    setName('');
    setTier('Med');
    setBestEvents('');
  };

  const tiers = ['High', 'Med', 'Low'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Athlete</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter athlete name"
          placeholderTextColor="#bdc3c7"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tier</Text>
        <View style={styles.tierSelector}>
          {tiers.map((tierOption) => (
            <TouchableOpacity
              key={tierOption}
              style={[
                styles.tierButton,
                tier === tierOption && styles.tierButtonActive
              ]}
              onPress={() => setTier(tierOption)}
            >
              <Text style={[
                styles.tierButtonText,
                tier === tierOption && styles.tierButtonTextActive
              ]}>
                {tierOption}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Best Events (Optional)</Text>
        <TextInput
          style={styles.input}
          value={bestEvents}
          onChangeText={setBestEvents}
          placeholder="e.g., 100m, 200m, 4x100"
          placeholderTextColor="#bdc3c7"
          multiline
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Add Athlete</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
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
  tierSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  tierButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  tierButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  tierButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  tierButtonTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AthleteForm; 
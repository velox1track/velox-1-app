import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import Papa from 'papaparse';

const CSVImporter = ({ onImportAthletes }) => {
  const [csvText, setCsvText] = useState('');
  const [previewData, setPreviewData] = useState(null);

  const parseCSV = () => {
    if (!csvText.trim()) {
      Alert.alert('Error', 'Please enter CSV data');
      return;
    }

    try {
      const result = Papa.parse(csvText.trim(), {
        header: true,
        skipEmptyLines: true,
      });

      if (result.errors.length > 0) {
        Alert.alert('CSV Parse Error', 'There was an error parsing the CSV data');
        return;
      }

      // Validate required columns
      const firstRow = result.data[0];
      if (!firstRow.name || !firstRow.tier) {
        Alert.alert('Invalid CSV Format', 'CSV must have "name" and "tier" columns');
        return;
      }

      // Transform data to athlete objects
      const athletes = result.data.map((row, index) => ({
        id: Date.now().toString() + index, // Generate unique ID
        name: row.name.trim(),
        tier: row.tier.trim(),
        bestEvents: row.bestEvents ? row.bestEvents.trim() : null,
      }));

      setPreviewData(athletes);
    } catch (error) {
      Alert.alert('Error', 'Failed to parse CSV data');
    }
  };

  const importAthletes = () => {
    if (previewData) {
      onImportAthletes(previewData);
      setCsvText('');
      setPreviewData(null);
      Alert.alert('Success', `Imported ${previewData.length} athletes`);
    }
  };

  const clearData = () => {
    setCsvText('');
    setPreviewData(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Athletes from CSV</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>CSV Data</Text>
        <Text style={styles.helpText}>
          Format: name,tier,bestEvents (bestEvents is optional)
        </Text>
        <TextInput
          style={styles.textArea}
          value={csvText}
          onChangeText={setCsvText}
          placeholder="Paste CSV data here..."
          placeholderTextColor="#bdc3c7"
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.parseButton} onPress={parseCSV}>
          <Text style={styles.buttonText}>Parse CSV</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearButton} onPress={clearData}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {previewData && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>
            Preview ({previewData.length} athletes)
          </Text>
          
          <ScrollView style={styles.previewList}>
            {previewData.map((athlete, index) => (
              <View key={athlete.id} style={styles.previewItem}>
                <Text style={styles.previewName}>{athlete.name}</Text>
                <View style={[styles.tierBadge, styles[`tier${athlete.tier}`]]}>
                  <Text style={styles.tierText}>{athlete.tier}</Text>
                </View>
                {athlete.bestEvents && (
                  <Text style={styles.previewEvents}>{athlete.bestEvents}</Text>
                )}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.importButton} onPress={importAthletes}>
            <Text style={styles.importButtonText}>Import {previewData.length} Athletes</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.exampleContainer}>
        <Text style={styles.exampleTitle}>Example CSV Format:</Text>
        <Text style={styles.exampleText}>
          name,tier,bestEvents{'\n'}
          John Smith,High,100m,200m{'\n'}
          Jane Doe,Med,400m{'\n'}
          Bob Wilson,Low,800m,1 Mile
        </Text>
      </View>
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
  helpText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  parseButton: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  previewList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    marginBottom: 6,
  },
  previewName: {
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
    marginHorizontal: 8,
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
  previewEvents: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
  },
  importButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  importButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exampleContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'monospace',
  },
});

export default CSVImporter; 
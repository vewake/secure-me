import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function LogsScreen() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load logs from AsyncStorage
  const loadLogs = async () => {
    try {
      const storedLogs = await AsyncStorage.getItem('captureLogs');
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load logs', error);
      setIsLoading(false);
    }
  };

  // Set up auto-refresh and initial load
  useEffect(() => {
    loadLogs();

    // Auto-refresh logs every 3 seconds if enabled
    let refreshInterval;
    if (autoRefresh) {
      refreshInterval = setInterval(loadLogs, 3000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  // Export logs to file and share
  const exportLogs = async () => {
    try {
      // Create file path for logs
      const fileDate = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = `${FileSystem.documentDirectory}sos-logs-${fileDate}.txt`;

      // Format logs for export
      const logContent = logs.join('\n');

      // Write to file
      await FileSystem.writeAsStringAsync(filePath, logContent);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        alert('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Failed to export logs: ' + error.message);
    }
  };

  // Clear all logs
  const clearLogs = async () => {
    try {
      await AsyncStorage.setItem('captureLogs', JSON.stringify([]));
      setLogs([]);
    } catch (error) {
      console.error('Failed to clear logs', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SOS Activity Logs</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, autoRefresh ? styles.activeButton : {}]}
            onPress={() => setAutoRefresh(!autoRefresh)}
          >
            <Text style={styles.headerButtonText}>
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={loadLogs}>
            <Text style={styles.headerButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>Total entries: {logs.length}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={exportLogs}>
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={clearLogs}>
            <Text style={styles.actionButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading logs...</Text>
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No logs available</Text>
        </View>
      ) : (
        <ScrollView style={styles.logsContainer}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logEntry}>{log}</Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    padding: 16,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 8,
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  headerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
  },
  logsContainer: {
    flex: 1,
    padding: 16,
  },
  logEntry: {
    fontSize: 14,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});


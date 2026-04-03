import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';

interface PhoneNumber {
  number: string;
  type: string;
}

interface Contact {
  id: string;
  name: string;
  phoneNumbers?: PhoneNumber[];
}

const TrustedContactsScreen: React.FC = () => {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');

  // Load saved contacts on initial render
  useEffect(() => {
    const loadSavedContacts = async () => {
      try {
        const savedContacts = await AsyncStorage.getItem('trustedContacts');
        if (savedContacts) {
          setSelectedContacts(JSON.parse(savedContacts));
        }
      } catch (error) {
        console.error('Error loading saved contacts:', error);
      }
    };
    loadSavedContacts();
  }, []);

  // Fetch all device contacts for modal
  const fetchAllContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers]
      });
      setContacts(data as Contact[]);
      setModalVisible(true);
    }
  };

  // Filter selected contacts based on search query
  const filteredSelectedContacts = selectedContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter contacts for modal
  const filteredModalContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) &&
    !selectedContacts.some(selected => selected.id === contact.id)
  );

  // Add contact from modal
  const addContact = (contact: Contact) => {
    setSelectedContacts(prev => [...prev, contact]);
    setModalVisible(false);
  };

  // Remove contact 
  const removeContact = (contact: Contact) => {
    setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
  };

  // Save trusted contacts
  const saveTrustedContacts = async () => {
    try {
      await AsyncStorage.setItem(
        'trustedContacts',
        JSON.stringify(selectedContacts)
      );
      setIsEditMode(false);
      alert('Trusted contacts saved successfully!');
    } catch (error) {
      console.error('Error saving contacts:', error);
      alert('Failed to save trusted contacts');
    }
  };

  // Render selected contact item
  const renderSelectedContact = ({ item }: { item: Contact }) => (
    <View style={styles.contactItem}>
      <View>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>
          {item.phoneNumbers?.[0]?.number || 'No phone number'}
        </Text>
      </View>
      {isEditMode && (
        <TouchableOpacity onPress={() => removeContact(item)}>
          <Text style={styles.removeButton}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render contact selection modal
  const renderContactModal = () => (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            value={modalSearchQuery}
            onChangeText={setModalSearchQuery}
          />

          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>

          <FlatList
            data={filteredModalContacts}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalContactItem}
                onPress={() => addContact(item)}
              >
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>
                  {item.phoneNumbers?.[0]?.number || 'No phone number'}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Trusted Contacts</Text>
        {!isEditMode && (
          <TouchableOpacity onPress={() => setIsEditMode(true)}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isEditMode && (
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      )}

      <FlatList
        data={filteredSelectedContacts}
        renderItem={renderSelectedContact}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>No trusted contacts selected</Text>
        }
      />

      {isEditMode && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={fetchAllContacts}
          >
            <Text style={styles.addButtonText}>Add Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveTrustedContacts}
            disabled={selectedContacts.length === 0}
          >
            <Text style={styles.saveButtonText}>
              Save ({selectedContacts.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {renderContactModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  editButton: {
    color: '#007bff',
    fontWeight: 'bold'
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  contactPhone: {
    color: 'gray'
  },
  removeButton: {
    color: 'red'
  },
  emptyListText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  addButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 16,
    maxHeight: '80%'
  },
  modalContactItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8
  },
  closeModalButton: {
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16
  },
  closeModalButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default TrustedContactsScreen;

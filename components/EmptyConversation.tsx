import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MessageSquare } from 'lucide-react-native';

const EmptyConversationList: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MessageSquare size={64} color="#CBD5E1" />
      </View>
      <Text style={styles.title}>No conversations yet</Text>
      <Text style={styles.description}>
        Start messaging with agents or clients to see your conversations here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
});

export default EmptyConversationList;
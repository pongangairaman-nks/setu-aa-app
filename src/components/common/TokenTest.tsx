import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { setuApi } from '../../services/api/setuApi';
import { Button } from './Button/Button';
import { LoadingSpinner } from './LoadingSpinner/LoadingSpinner';

export const TokenTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [fipsData, setFipsData] = useState<any>(null);

  const handleFetchToken = async () => {
    try {
      setLoading(true);
      console.log('🔐 Fetching Setu token...');
      
      const token = await setuApi.fetchToken();
      setTokenInfo(token);
      
      Alert.alert('Success', 'Token fetched successfully!');
      console.log('✅ Token fetched:', token);
    } catch (error) {
      console.error('❌ Token fetch failed:', error);
      Alert.alert('Error', `Failed to fetch token: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTokenInfo = async () => {
    try {
      setLoading(true);
      console.log('🔍 Getting token info...');
      
      const info = await setuApi.getTokenInfo();
      setTokenInfo(info);
      
      console.log('✅ Token info:', info);
    } catch (error) {
      console.error('❌ Get token info failed:', error);
      Alert.alert('Error', `Failed to get token info: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestFIPs = async () => {
    try {
      setLoading(true);
      console.log('🏛️ Testing FIPs with token...');
      
      const fips = await setuApi.getFIPs();
      setFipsData(fips);
      
      Alert.alert('Success', 'FIPs fetched successfully!');
      console.log('✅ FIPs data:', fips);
    } catch (error) {
      console.error('❌ FIPs test failed:', error);
      Alert.alert('Error', `Failed to fetch FIPs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearToken = async () => {
    try {
      setLoading(true);
      console.log('🗑️ Clearing token...');
      
      await setuApi.clearToken();
      setTokenInfo(null);
      setFipsData(null);
      
      Alert.alert('Success', 'Token cleared successfully!');
      console.log('✅ Token cleared');
    } catch (error) {
      console.error('❌ Clear token failed:', error);
      Alert.alert('Error', `Failed to clear token: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        🔐 Setu Token Test
      </Text>

      <View style={{ gap: 15, marginBottom: 30 }}>
        <Button 
          title="Fetch New Token" 
          onPress={handleFetchToken}
          disabled={loading}
        />
        
        <Button 
          title="Get Token Info" 
          onPress={handleGetTokenInfo}
          disabled={loading}
        />
        
        <Button 
          title="Test FIPs with Token" 
          onPress={handleTestFIPs}
          disabled={loading}
        />
        
        <Button 
          title="Clear Token" 
          onPress={handleClearToken}
          disabled={loading}
          variant="secondary"
        />
      </View>

      {loading && (
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <LoadingSpinner />
          <Text style={{ marginTop: 10 }}>Loading...</Text>
        </View>
      )}

      {tokenInfo && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            📋 Token Information
          </Text>
          <View style={{ 
            backgroundColor: '#f5f5f5', 
            padding: 15, 
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: tokenInfo.isValid ? '#4CAF50' : '#f44336'
          }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>
              {JSON.stringify(tokenInfo, null, 2)}
            </Text>
          </View>
        </View>
      )}

      {fipsData && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            🏛️ FIPs Data
          </Text>
          <View style={{ 
            backgroundColor: '#f5f5f5', 
            padding: 15, 
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#2196F3'
          }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>
              {JSON.stringify(fipsData, null, 2)}
            </Text>
          </View>
        </View>
      )}

      <View style={{ 
        backgroundColor: '#e3f2fd', 
        padding: 15, 
        borderRadius: 8,
        marginTop: 20
      }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          📝 Instructions
        </Text>
        <Text style={{ lineHeight: 20 }}>
          1. <Text style={{ fontWeight: 'bold' }}>Fetch New Token</Text>: Get a fresh token from Setu
        </Text>
        <Text style={{ lineHeight: 20 }}>
          2. <Text style={{ fontWeight: 'bold' }}>Get Token Info</Text>: Check current token status
        </Text>
        <Text style={{ lineHeight: 20 }}>
          3. <Text style={{ fontWeight: 'bold' }}>Test FIPs</Text>: Use token to call Setu API
        </Text>
        <Text style={{ lineHeight: 20 }}>
          4. <Text style={{ fontWeight: 'bold' }}>Clear Token</Text>: Remove stored token
        </Text>
      </View>
    </ScrollView>
  );
};

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { setuApi } from '../../services/api/setuApi';
import { apiClient } from '../../services/api/apiClient';
import { ENV } from '../../config/environment';
import { ConfigTestStyles } from './ConfigTest.styles';

export const ConfigTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testHealthCheck = async () => {
    setIsLoading(true);
    addResult('🏥 Testing health check...');
    
    try {
      const health = await setuApi.healthCheck();
      addResult(`✅ Health check successful: ${JSON.stringify(health)}`);
    } catch (error: any) {
      addResult(`❌ Health check failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiConfiguration = async () => {
    setIsLoading(true);
    addResult('🔧 Testing API configuration...');
    
    try {
      const apiInfo = setuApi.getApiInfo();
      addResult(`📡 API Base URL: ${apiInfo.baseUrl}`);
      addResult(`🔒 HTTPS Enabled: ${apiInfo.isSecure ? 'Yes' : 'No'}`);
      addResult(`🌍 Environment: ${apiInfo.environment}`);
      addResult(`⏰ Timeout: ${apiInfo.timeout}ms`);
      
      // Test if the base URL is accessible
      const isHealthy = await apiClient.healthCheck();
      addResult(`🏥 Backend Health: ${isHealthy ? 'Online' : 'Offline'}`);
    } catch (error: any) {
      addResult(`❌ API configuration test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSetuConfiguration = async () => {
    setIsLoading(true);
    addResult('🔐 Testing Setu configuration...');
    
    try {
      addResult(`🏛️ Setu Base URL: ${ENV.SETU_BASE_URL}`);
      addResult(`🆔 Client ID: ${ENV.SETU_CLIENT_ID}`);
      addResult(`📦 Product ID: ${ENV.SETU_PRODUCT_ID}`);
      
      // Test Setu configuration endpoint
      const response = await fetch(`${ENV.API_BASE_URL.replace('/api', '')}/test-setu`);
      const data = await response.json();
      addResult(`🧪 Setu Config Test: ${data.success ? 'Success' : 'Failed'}`);
      if (!data.success) {
        addResult(`⚠️ Setu Config Error: ${data.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Setu configuration test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCallbackEndpoint = async () => {
    setIsLoading(true);
    addResult('🔄 Testing callback endpoint...');
    
    try {
      const callbackUrl = `${ENV.API_BASE_URL.replace('/api', '')}/api/consents/callback?consentId=test123&status=ACTIVE`;
      addResult(`📞 Callback URL: ${callbackUrl}`);
      
      const response = await fetch(callbackUrl);
      addResult(`📡 Callback Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 302) {
        const location = response.headers.get('location');
        addResult(`🔄 Redirect Location: ${location}`);
      }
    } catch (error: any) {
      addResult(`❌ Callback endpoint test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testWebhookEndpoint = async () => {
    setIsLoading(true);
    addResult('📡 Testing webhook endpoint...');
    
    try {
      const webhookUrl = `${ENV.API_BASE_URL.replace('/api', '')}/api/webhooks/setu`;
      addResult(`📞 Webhook URL: ${webhookUrl}`);
      
      const webhookData = {
        type: 'CONSENT_STATUS_UPDATE',
        consentId: 'test123',
        status: 'ACTIVE',
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });
      
      const data = await response.json();
      addResult(`📡 Webhook Status: ${response.status} ${response.statusText}`);
      addResult(`📄 Webhook Response: ${JSON.stringify(data)}`);
    } catch (error: any) {
      addResult(`❌ Webhook endpoint test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    clearResults();
    addResult('🚀 Starting comprehensive configuration test...');
    addResult(`🌍 Environment: ${ENV.NODE_ENV}`);
    addResult(`🔗 Domain: hedgrpay.com`);
    addResult(`🔒 HTTPS: ${ENV.API_BASE_URL.startsWith('https://') ? 'Enabled' : 'Disabled'}`);
    addResult('');
    
    await testApiConfiguration();
    addResult('');
    await testHealthCheck();
    addResult('');
    await testSetuConfiguration();
    addResult('');
    await testCallbackEndpoint();
    addResult('');
    await testWebhookEndpoint();
    addResult('');
    addResult('✅ All tests completed!');
    setIsLoading(false);
  };

  return (
    <ScrollView style={ConfigTestStyles.container}>
      <Text style={ConfigTestStyles.title}>🔧 Configuration Test</Text>
      <Text style={ConfigTestStyles.subtitle}>Test your HTTPS endpoints with hedgrpay.com</Text>
      
      <View style={ConfigTestStyles.buttonContainer}>
        <TouchableOpacity 
          style={[ConfigTestStyles.button, ConfigTestStyles.primaryButton]} 
          onPress={runAllTests}
          disabled={isLoading}
        >
          <Text style={ConfigTestStyles.buttonText}>
            {isLoading ? '🔄 Running Tests...' : '🚀 Run All Tests'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[ConfigTestStyles.button, ConfigTestStyles.secondaryButton]} 
          onPress={testApiConfiguration}
          disabled={isLoading}
        >
          <Text style={ConfigTestStyles.buttonText}>🔧 API Config</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[ConfigTestStyles.button, ConfigTestStyles.secondaryButton]} 
          onPress={testHealthCheck}
          disabled={isLoading}
        >
          <Text style={ConfigTestStyles.buttonText}>🏥 Health Check</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[ConfigTestStyles.button, ConfigTestStyles.secondaryButton]} 
          onPress={testSetuConfiguration}
          disabled={isLoading}
        >
          <Text style={ConfigTestStyles.buttonText}>🔐 Setu Config</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[ConfigTestStyles.button, ConfigTestStyles.secondaryButton]} 
          onPress={testCallbackEndpoint}
          disabled={isLoading}
        >
          <Text style={ConfigTestStyles.buttonText}>🔄 Callback</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[ConfigTestStyles.button, ConfigTestStyles.secondaryButton]} 
          onPress={testWebhookEndpoint}
          disabled={isLoading}
        >
          <Text style={ConfigTestStyles.buttonText}>📡 Webhook</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[ConfigTestStyles.button, ConfigTestStyles.clearButton]} 
          onPress={clearResults}
        >
          <Text style={ConfigTestStyles.buttonText}>🗑️ Clear Results</Text>
        </TouchableOpacity>
      </View>
      
      <View style={ConfigTestStyles.resultsContainer}>
        <Text style={ConfigTestStyles.resultsTitle}>📋 Test Results:</Text>
        {results.map((result, index) => (
          <Text key={index} style={ConfigTestStyles.resultText}>
            {result}
          </Text>
        ))}
        {results.length === 0 && (
          <Text style={ConfigTestStyles.noResults}>No test results yet. Run a test to see results.</Text>
        )}
      </View>
    </ScrollView>
  );
};

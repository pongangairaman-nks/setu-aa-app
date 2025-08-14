import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class SecureStorage {
  private isWeb = Platform.OS === 'web';

  async getItemAsync(key: string): Promise<string | null> {
    try {
      if (this.isWeb) {
        return localStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  }

  async setItemAsync(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb) {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Error setting item in storage:', error);
      throw error;
    }
  }

  async deleteItemAsync(key: string): Promise<void> {
    try {
      if (this.isWeb) {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Error deleting item from storage:', error);
    }
  }
}

export const secureStorage = new SecureStorage();

// Export individual functions for convenience
export const setItem = (key: string, value: string) => secureStorage.setItemAsync(key, value);
export const getItem = (key: string) => secureStorage.getItemAsync(key);
export const removeItem = (key: string) => secureStorage.deleteItemAsync(key);
export const setObject = <T>(key: string, value: T) => {
  const jsonValue = JSON.stringify(value);
  return secureStorage.setItemAsync(key, jsonValue);
};
export const getObject = <T>(key: string): Promise<T | null> => {
  return secureStorage.getItemAsync(key).then(jsonValue => {
    if (jsonValue) {
      return JSON.parse(jsonValue) as T;
    }
    return null;
  });
};
export const setBoolean = (key: string, value: boolean) => secureStorage.setItemAsync(key, value.toString());
export const getBoolean = (key: string): Promise<boolean | null> => {
  return secureStorage.getItemAsync(key).then(value => {
    if (value === null) return null;
    return value === 'true';
  });
};
export const setNumber = (key: string, value: number) => secureStorage.setItemAsync(key, value.toString());
export const getNumber = (key: string): Promise<number | null> => {
  return secureStorage.getItemAsync(key).then(value => {
    if (value === null) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  });
}; 
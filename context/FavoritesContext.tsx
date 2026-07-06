import React, { ReactNode, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { db } from '../firebase-config';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { logger } from '../utils/logger';

export interface FavoritesContextType {
  favorites: Set<string>;
  isFavorited: (countryCode: string) => boolean;
  toggleFavorite: (countryCode: string) => Promise<void>;
  getFavorites: () => string[];
  isLoading: boolean;
}

const FavoritesContext = React.createContext<FavoritesContextType>({
  favorites: new Set(),
  isFavorited: () => false,
  toggleFavorite: async () => {},
  getFavorites: () => [],
  isLoading: true,
});

export const useFavorites = () => {
  const context = React.useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

const FAVORITES_STORAGE_KEY = 'worldexplorer_favorites';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const netInfo = useNetInfo();

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          setFavorites(new Set(JSON.parse(stored)));
        }
        setIsLoading(false);
      } catch (error) {
        logger.error('Failed to load favorites', {
          context: 'FavoritesContext',
          timestamp: new Date().toISOString(),
          metadata: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
        setIsLoading(false);
      }
    };
    loadFavorites();
  }, []);

  // Sync to Firebase when network available
  useEffect(() => {
    if (netInfo.isConnected && favorites.size > 0) {
      syncFavoritesToFirebase();
    }
  }, [netInfo.isConnected]);

  const syncFavoritesToFirebase = async () => {
    try {
      const userId = 'user-123'; // TODO: Replace with actual authenticated user ID
      const favoritesCollection = collection(db, 'users', userId, 'favorites');

      for (const countryCode of favorites) {
        await setDoc(doc(favoritesCollection, countryCode), {
          countryCode,
          addedAt: new Date(),
        });
      }
      logger.info('Favorites synced to Firebase', {
        context: 'FavoritesContext',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn('Failed to sync favorites to Firebase', {
        context: 'FavoritesContext',
        timestamp: new Date().toISOString(),
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  const toggleFavorite = async (countryCode: string) => {
    const updated = new Set(favorites);
    if (updated.has(countryCode)) {
      updated.delete(countryCode);
    } else {
      updated.add(countryCode);
    }
    setFavorites(updated);

    // Persist to AsyncStorage
    try {
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(Array.from(updated))
      );
    } catch (error) {
      logger.error('Failed to save favorites', {
        context: 'FavoritesContext',
        timestamp: new Date().toISOString(),
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  const isFavorited = (countryCode: string) => favorites.has(countryCode);
  const getFavorites = () => Array.from(favorites);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorited,
        toggleFavorite,
        getFavorites,
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

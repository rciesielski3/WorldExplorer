import React, { ReactNode, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { db } from '../firebase-config';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
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

  // TODO: Replace with the actual authenticated user ID once auth is wired up.
  const userId = 'user-123';

  const getFavoritesCollection = () => collection(db, 'users', userId, 'favorites');

  /**
   * Reconcile the full local favorites set with Firestore: write anything
   * that's missing and delete anything remote that's no longer favorited
   * locally. Used for full sync (e.g. when transitioning from offline to
   * online), not for routine per-toggle updates.
   */
  const reconcileFavoritesWithFirebase = async (current: Set<string>) => {
    try {
      const favoritesCollection = getFavoritesCollection();
      const snapshot = await getDocs(favoritesCollection);
      const remoteCodes = new Set(snapshot.docs.map((d) => d.id));

      const toAdd = Array.from(current).filter((code) => !remoteCodes.has(code));
      const toDelete = Array.from(remoteCodes).filter((code) => !current.has(code));

      await Promise.all([
        ...toAdd.map((countryCode) =>
          setDoc(doc(favoritesCollection, countryCode), {
            countryCode,
            addedAt: new Date(),
          })
        ),
        ...toDelete.map((countryCode) => deleteDoc(doc(favoritesCollection, countryCode))),
      ]);

      logger.info('Favorites reconciled with Firebase', {
        context: 'FavoritesContext',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn('Failed to reconcile favorites with Firebase', {
        context: 'FavoritesContext',
        timestamp: new Date().toISOString(),
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  // Perform a full reconciliation whenever we (re)gain connectivity, so any
  // changes made while offline are pushed to Firestore.
  useEffect(() => {
    if (netInfo.isConnected) {
      reconcileFavoritesWithFirebase(favorites);
    }
    // Only re-run when connectivity changes; the reconciliation intentionally
    // reads `favorites` fresh via the closure rather than re-triggering sync
    // on every keystroke-level favorites change (that's handled per-toggle).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [netInfo.isConnected]);

  const toggleFavorite = async (countryCode: string) => {
    const updated = new Set(favorites);
    const isRemoving = updated.has(countryCode);
    if (isRemoving) {
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

    // Sync this single change to Firebase in real time when online, instead
    // of waiting for the next full reconciliation pass.
    if (netInfo.isConnected) {
      try {
        const favoritesCollection = getFavoritesCollection();
        if (isRemoving) {
          await deleteDoc(doc(favoritesCollection, countryCode));
        } else {
          await setDoc(doc(favoritesCollection, countryCode), {
            countryCode,
            addedAt: new Date(),
          });
        }
      } catch (error) {
        logger.warn('Failed to sync favorite to Firebase', {
          context: 'FavoritesContext',
          timestamp: new Date().toISOString(),
          metadata: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
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

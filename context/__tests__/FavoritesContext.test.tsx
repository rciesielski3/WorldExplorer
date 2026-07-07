import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { FavoritesProvider, useFavorites } from '../FavoritesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, TouchableOpacity } from 'react-native';

const TestComponent = () => {
  const { isFavorited, toggleFavorite, getFavorites } = useFavorites();
  return (
    <>
      <Text>{isFavorited('US') ? 'Favorited' : 'Not Favorited'}</Text>
      <TouchableOpacity onPress={() => toggleFavorite('US')} testID="toggle-btn">
        <Text>Toggle</Text>
      </TouchableOpacity>
    </>
  );
};

describe('FavoritesContext', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });

  it('should toggle favorite', async () => {
    const { getByTestId, getByText } = render(
      <FavoritesProvider>
        <TestComponent />
      </FavoritesProvider>
    );

    expect(getByText('Not Favorited')).toBeTruthy();

    fireEvent.press(getByTestId('toggle-btn'));

    await waitFor(() => {
      expect(getByText('Favorited')).toBeTruthy();
    });
  });

  it('should persist favorites to AsyncStorage', async () => {
    const { getByTestId } = render(
      <FavoritesProvider>
        <TestComponent />
      </FavoritesProvider>
    );

    fireEvent.press(getByTestId('toggle-btn'));

    await waitFor(() => {
      expect(AsyncStorage.getItem('worldexplorer_favorites')).resolves.toEqual(
        JSON.stringify(['US'])
      );
    });
  });
});

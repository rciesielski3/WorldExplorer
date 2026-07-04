import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { SearchBar } from '../SearchBar';
import { ThemeProvider } from '../../../../context/ThemeContext';

describe('SearchBar', () => {
  it('should call onSearch with query', async () => {
    const onSearch = jest.fn();
    const { getByTestId } = render(
      <ThemeProvider>
        <SearchBar onSearch={onSearch} />
      </ThemeProvider>
    );

    await act(async () => {});

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'USA');

    expect(onSearch).toHaveBeenCalledWith('USA');
  });

  it('should clear search on clear button press', async () => {
    const onSearch = jest.fn();
    const { getByTestId } = render(
      <ThemeProvider>
        <SearchBar onSearch={onSearch} />
      </ThemeProvider>
    );

    await act(async () => {});

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'USA');

    await waitFor(() => {
      expect(getByTestId('clear-btn')).toBeTruthy();
    });

    fireEvent.press(getByTestId('clear-btn'));

    expect(onSearch).toHaveBeenCalledWith('');
  });
});

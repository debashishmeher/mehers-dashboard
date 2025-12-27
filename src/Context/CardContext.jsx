import { createContext, useContext, useEffect, useState } from 'react';
import { cardService } from '../Services/cardService';

const CardContext = createContext();

export const CardProvider = ({ children, cardId }) => {
  const [cardData, setCardData] = useState(null);
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(cardId ? 'single' : 'all'); // 'single' or 'all'

  // Fetch single card by ID
  const fetchSingleCard = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const card = await cardService.fetchCardById(id);
      setCardData(card);
      setMode('single');
    } catch (err) {
      setError(err.message || 'Failed to fetch card');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all cards for the user
  const fetchAllCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const cards = await cardService.fetchAllCards();
      setAllCards(cards);
      setMode('all');
    } catch (err) {
      setError(err.message || 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refresh = () => {
    if (mode === 'single' && cardId) {
      fetchSingleCard(cardId);
    } else {
      fetchAllCards();
    }
  };

  // Create new card
  const createCard = async (cardData) => {
    try {
      const newCard = await cardService.createCard(cardData);
      if (mode === 'all') {
        setAllCards(prev => [newCard, ...prev]);
      }
      return newCard;
    } catch (err) {
      setError(err.message || 'Failed to create card');
      throw err;
    }
  };

  // Update card
  const updateCard = async (cardId, updates) => {
    try {
      const updatedCard = await cardService.updateCard(cardId, updates);
      
      if (mode === 'single' && cardData?._id === cardId) {
        setCardData(updatedCard);
      }
      
      if (mode === 'all') {
        setAllCards(prev => 
          prev.map(card => card._id === cardId ? updatedCard : card)
        );
      }
      
      return updatedCard;
    } catch (err) {
      setError(err.message || 'Failed to update card');
      throw err;
    }
  };

  // Delete card
  const deleteCard = async (cardId) => {
    try {
      await cardService.deleteCard(cardId);
      
      if (mode === 'single' && cardData?._id === cardId) {
        setCardData(null);
      }
      
      if (mode === 'all') {
        setAllCards(prev => prev.filter(card => card._id !== cardId));
      }
    } catch (err) {
      setError(err.message || 'Failed to delete card');
      throw err;
    }
  };

  useEffect(() => {
    if (cardId) {
      fetchSingleCard(cardId);
    } else {
      fetchAllCards();
    }
  }, [cardId]);

  const value = {
    // Single card data
    cardData,
    
    // All cards data
    allCards,
    
    // State
    loading,
    error,
    mode,
    
    // Actions
    setCardData,
    setAllCards,
    refresh,
    createCard,
    updateCard,
    deleteCard,
    fetchSingleCard,
    fetchAllCards,
  };

  return (
    <CardContext.Provider value={value}>
      {children}
    </CardContext.Provider>
  );
};

// Custom hook for easy context access
export const useCard = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCard must be used within a CardProvider');
  }
  return context;
};
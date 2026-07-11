import { getCookie } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

class CardService {
  constructor() {
    this.baseURL = `${API_URL}/api/user`;
  }

  getAuthHeaders() {
    const authToken = getCookie("authToken");
    return {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` })
    };
  }

  async handleResponse(response, errorMessage = 'Request failed') {
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || errorMessage);
      } catch {
        throw new Error(response.statusText || errorMessage);
      }
    }

    const data = await response.json();
    return data.data || data;
  }

  // Fetch all cards for the user
  async fetchAllCards() {
    try {
      const response = await fetch(`${this.baseURL}/card`, {
        method: "GET",
        headers: this.getAuthHeaders(),
        credentials: "include",
      });

      const data = await this.handleResponse(response, 'Failed to fetch cards');
      return data.cards || [];
    } catch (error) {
      console.error('CardService - fetchAllCards error:', error);
      throw error;
    }
  }

  // Fetch single card by ID
  async fetchCardById(cardId) {
    try {
      const response = await fetch(`${this.baseURL}/card/${cardId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
        credentials: "include",
      });

      const data = await this.handleResponse(response, 'Failed to fetch card');
      return data.card || null;
    } catch (error) {
      console.error('CardService - fetchCardById error:', error);
      throw error;
    }
  }

  // Fetch current user's card (legacy support)
  async fetchCard() {
    try {
      const cards = await this.fetchAllCards();
      return cards.length > 0 ? cards[0] : null;
    } catch (error) {
      console.error('CardService - fetchCard error:', error);
      throw error;
    }
  }

  async createCard(cardData) {
    try {
      const response = await fetch(`${this.baseURL}/card`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(cardData),
      });

      const data = await this.handleResponse(response, 'Failed to create card');
      return data.card || data;
    } catch (error) {
      console.error('CardService - createCard error:', error);
      throw error;
    }
  }

  async updateCard(cardId, cardData) {
    try {
      const response = await fetch(`${this.baseURL}/card/${cardId}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(cardData),
      });

      const data = await this.handleResponse(response, 'Failed to update card');
      return data.card || data;
    } catch (error) {
      console.error('CardService - updateCard error:', error);
      throw error;
    }
  }

  async deleteCard(cardId) {
    try {
      const response = await fetch(`${this.baseURL}/card/${cardId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
        credentials: "include",
      });

      return await this.handleResponse(response, 'Failed to delete card');
    } catch (error) {
      console.error('CardService - deleteCard error:', error);
      throw error;
    }
  }

  // Utility methods
  generateCardUrl(slug) {
    return slug ? `https://thryvoo.com/b/${slug}` : null;
  }

  async hasCard() {
    try {
      const cards = await this.fetchAllCards();
      return cards.length > 0;
    } catch (error) {
      console.error('CardService - hasCard error:', error);
      return false;
    }
  }
}

export const cardService = new CardService();
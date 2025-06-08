import { useState, useEffect } from 'react';
import { Participant, Purchase, NextBuyerResponse } from '@/types/coffee';

// Define the type for reorder history entries within the hook
interface ReorderHistoryEntry {
  id: number;
  timestamp: string;
  old_order: string; // JSON string of participant IDs
  new_order: string; // JSON string of participant IDs
}

export function useCoffeeData() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [nextBuyer, setNextBuyer] = useState<NextBuyerResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // State for reorder history
  const [reorderHistory, setReorderHistory] = useState<ReorderHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/participants');
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/purchases');
      const data = await response.json();
      setPurchases(data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchNextBuyer = async () => {
    try {
      const response = await fetch('/api/next-buyer');
      const data = await response.json();
      setNextBuyer(data);
    } catch (error) {
      console.error('Error fetching next buyer:', error);
    }
  };

  const addParticipant = async (name: string) => {
    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      await fetchParticipants();
      await fetchNextBuyer();
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  };

  const updateParticipant = async (id: number, name: string) => {
    try {
      const response = await fetch(`/api/participants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      await fetchParticipants();
      await fetchNextBuyer();
    } catch (error) {
      console.error('Error updating participant:', error);
      throw error;
    }
  };

  const reorderParticipants = async (participantIds: number[]) => {
    try {
      const response = await fetch('/api/participants/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const updatedParticipants = await response.json();
      setParticipants(updatedParticipants);
      await fetchNextBuyer();
      // Optionally, refetch history if reordering affects it directly or if desired
      // await fetchReorderHistory();
    } catch (error) {
      console.error('Error reordering participants:', error);
      throw error;
    }
  };

  const deleteParticipant = async (id: number) => {
    try {
      const response = await fetch(`/api/participants/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      await fetchParticipants();
      await fetchNextBuyer();
    } catch (error) {
      console.error('Error deleting participant:', error);
      throw error;
    }
  };

  const recordPurchase = async (participantId: number) => {
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant_id: participantId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      await fetchPurchases();
      await fetchNextBuyer();
    } catch (error) {
      console.error('Error recording purchase:', error);
      throw error;
    }
  };

  const clearPurchaseHistory = async () => {
    try {
      const response = await fetch('/api/purchases', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      await fetchPurchases();
      await fetchNextBuyer();
    } catch (error) {
      console.error('Error clearing purchase history:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchParticipants(),
        fetchPurchases(),
        fetchNextBuyer(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  const fetchReorderHistory = async () => {
    setLoadingHistory(true);
    setErrorHistory(null);
    try {
      const response = await fetch('/api/reorder-history');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch reorder history: ${response.statusText}`);
      }
      const data: ReorderHistoryEntry[] = await response.json();
      setReorderHistory(data);
    } catch (error) {
      console.error('Error fetching reorder history:', error);
      if (error instanceof Error) {
        setErrorHistory(error.message);
      } else {
        setErrorHistory('An unknown error occurred while fetching reorder history.');
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  return {
    participants,
    purchases,
    nextBuyer,
    loading,
    addParticipant,
    updateParticipant,
    reorderParticipants,
    deleteParticipant,
    recordPurchase,
    clearPurchaseHistory,
    refetch: () => {
      fetchParticipants();
      fetchPurchases();
      fetchNextBuyer();
      // Optionally include fetchReorderHistory in general refetch if desired
      // fetchReorderHistory();
    },
    // Expose reorder history data and functions
    reorderHistory,
    loadingHistory,
    errorHistory,
    fetchReorderHistory,
  };
}

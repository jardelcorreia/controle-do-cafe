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

  const recordOutOfOrderPurchase = async (selectedBuyerId: number, currentNextBuyerId: number | null | undefined) => {
    try {
      // Step 1: Record the purchase for the selected buyer
      const purchaseResponse = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: selectedBuyerId }),
      });
      if (!purchaseResponse.ok) {
        const error = await purchaseResponse.json();
        throw new Error(error.error || 'Failed to record out-of-order purchase');
      }

      // Step 2: Fetch the current (potentially updated by another user) list of participants
      // to ensure reordering is based on the latest state.
      const participantsResponse = await fetch('/api/participants');
      if (!participantsResponse.ok) {
        throw new Error('Failed to fetch participants for reordering');
      }
      const currentParticipants: Participant[] = await participantsResponse.json();

      // Step 3: Calculate the new order
      let newOrderedIds: number[];
      const remainingParticipants = currentParticipants.filter(p => p.id !== selectedBuyerId);

      if (currentNextBuyerId && currentNextBuyerId !== selectedBuyerId && remainingParticipants.find(p => p.id === currentNextBuyerId)) {
        // If the original next buyer is still in the list (and wasn't the one who bought),
        // they should be at the front of the "remaining" list before the selected buyer is appended.
        const nextBuyerActual = remainingParticipants.find(p => p.id === currentNextBuyerId);
        const others = remainingParticipants.filter(p => p.id !== currentNextBuyerId);
        newOrderedIds = [nextBuyerActual!.id, ...others.map(p => p.id), selectedBuyerId];
      } else {
        // Fallback: just move selected buyer to the end of the current order of remaining participants.
        newOrderedIds = [...remainingParticipants.map(p => p.id), selectedBuyerId];
      }

      // Ensure all participants are in the newOrderedIds, otherwise add them to the end before selectedBuyerId
      const currentParticipantIds = currentParticipants.map(p => p.id);
      for (const id of currentParticipantIds) {
          if (!newOrderedIds.includes(id)) {
              // Insert before the last element (selectedBuyerId)
              const insertIndex = newOrderedIds.length > 0 ? newOrderedIds.length -1 : 0;
              newOrderedIds.splice(insertIndex, 0, id);
          }
      }
      // Remove duplicates just in case, keeping first occurrence
      newOrderedIds = [...new Set(newOrderedIds)];

      // Step 4: Call the existing reorderParticipants function
      await reorderParticipants(newOrderedIds);

      // Step 5: Refetch purchases (participants & nextBuyer are already refetched by reorderParticipants)
      await fetchPurchases();

    } catch (error) {
      console.error('Error in recordOutOfOrderPurchase:', error);
      throw error; // Re-throw to be caught by UI if needed
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
    recordOutOfOrderPurchase, // Add this
  };
}

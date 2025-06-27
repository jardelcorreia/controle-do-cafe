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
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);
  const [nextBuyerError, setNextBuyerError] = useState<string | null>(null);

  // State for reorder history
  const [reorderHistory, setReorderHistory] = useState<ReorderHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);

  const fetchParticipants = async () => {
    setParticipantsError(null);
    try {
      const response = await fetch('/api/participants');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch participants: ${response.statusText}`);
      }
      setParticipants(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching participants.';
      setParticipantsError(errorMessage);
      setParticipants([]);
    } finally {
      // Add any participant-specific loading reset here if needed in the future
    }
  };

  const deletePurchase = async (purchaseId: number, isExternal: boolean) => {
    try {
      const type = isExternal ? 'external' : 'coffee';
      const response = await fetch(`/api/purchases/${purchaseId}?type=${type}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to delete purchase ${purchaseId}`);
      }

      // Refetch data to update the UI
      await fetchPurchases();
      await fetchNextBuyer(); // Next buyer might change if the deleted purchase was the last one
    } catch (error) {
      console.error('Error deleting purchase:', error);
      // Propagate the error so the UI can handle it (e.g., show a notification)
      throw error;
    }
  };

  const fetchPurchases = async () => {
    setPurchasesError(null);
    try {
      const response = await fetch('/api/purchases');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch purchases: ${response.statusText}`);
      }
      setPurchases(data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching purchases.';
      setPurchasesError(errorMessage);
      setPurchases([]);
    } finally {
      // Add any purchase-specific loading reset here if needed in the future
    }
  };

  const fetchNextBuyer = async () => {
    setNextBuyerError(null);
    try {
      const response = await fetch('/api/next-buyer');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch next buyer: ${response.statusText}`);
      }
      setNextBuyer(data);
    } catch (error) {
      console.error('Error fetching next buyer:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching next buyer.';
      setNextBuyerError(errorMessage);
      setNextBuyer(null);
    } finally {
      // Add any nextBuyer-specific loading reset here if needed in the future
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

  const recordOutOfOrderPurchase = async (data: { participantId?: number; buyerName?: string; currentNextBuyerId: number | null | undefined }) => {
    try {
      const { participantId, buyerName, currentNextBuyerId } = data;
      let requestBody;

      if (participantId) {
        requestBody = JSON.stringify({ participant_id: participantId });
      } else if (buyerName) {
        requestBody = JSON.stringify({ buyer_name: buyerName });
      } else {
        throw new Error('Either participantId or buyerName must be provided');
      }

      // Step 1: Record the purchase
      const purchaseResponse = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });

      if (!purchaseResponse.ok) {
        const error = await purchaseResponse.json();
        throw new Error(error.error || 'Failed to record purchase');
      }

      // Step 2: Refetch purchases for all cases
      await fetchPurchases();

      if (participantId) {
        // Step 3: Fetch the current (potentially updated by another user) list of participants
        // to ensure reordering is based on the latest state.
        const participantsResponse = await fetch('/api/participants');
        if (!participantsResponse.ok) {
          throw new Error('Failed to fetch participants for reordering');
        }
        const currentParticipants: Participant[] = await participantsResponse.json();

        // Step 4: Calculate the new order
        let newOrderedIds: number[];
        const remainingParticipants = currentParticipants.filter(p => p.id !== participantId);

        if (currentNextBuyerId && currentNextBuyerId !== participantId && remainingParticipants.find(p => p.id === currentNextBuyerId)) {
          const nextBuyerActual = remainingParticipants.find(p => p.id === currentNextBuyerId);
          const others = remainingParticipants.filter(p => p.id !== currentNextBuyerId);
          newOrderedIds = [nextBuyerActual!.id, ...others.map(p => p.id), participantId];
        } else {
          newOrderedIds = [...remainingParticipants.map(p => p.id), participantId];
        }

        const currentParticipantIds = currentParticipants.map(p => p.id);
        for (const id of currentParticipantIds) {
          if (!newOrderedIds.includes(id)) {
            const insertIndex = newOrderedIds.length > 0 ? newOrderedIds.length - 1 : 0;
            newOrderedIds.splice(insertIndex, 0, id);
          }
        }
        newOrderedIds = [...new Set(newOrderedIds)];

        // Step 5: Call the existing reorderParticipants function
        // This will also refetch participants and nextBuyer
        await reorderParticipants(newOrderedIds);
      } else {
        // External purchase, no reordering needed, but still refetch next buyer
        // as the purchase list (which might influence next buyer if it was empty) has changed.
        await fetchNextBuyer();
      }

    } catch (error) {
      console.error('Error in recordOutOfOrderPurchase:', error);
      throw error; // Re-throw to be caught by UI if needed
    }
  };

  return {
    participants,
    participantsError,
    purchases,
    purchasesError,
    nextBuyer,
    nextBuyerError,
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
    deletePurchase, // Add this
  };
}

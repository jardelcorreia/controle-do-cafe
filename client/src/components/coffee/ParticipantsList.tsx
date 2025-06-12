import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Info, History, Save, X } from 'lucide-react'; // Added Save, X
import { useState, useEffect } from 'react';
import { ReorderHistoryDialog } from './ReorderHistoryDialog';
// Removed DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors from '@dnd-kit/core'
// Removed arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy from '@dnd-kit/sortable'
// Removed restrictToVerticalAxis from '@dnd-kit/modifiers'
import { Participant } from '@/types/coffee';
import { ParticipantItem } from './ParticipantItem'; // Changed from SortableParticipantItem

interface ParticipantsListProps {
  participants: Participant[];
  onAddParticipant: (name: string) => Promise<void>;
  onUpdateParticipant: (id: number, name: string) => Promise<void>;
  onReorderParticipants: (participantIds: number[]) => Promise<void>;
  onDeleteParticipant: (id: number) => Promise<void>;
  loading?: boolean;
}

export function ParticipantsList({
  participants,
  onAddParticipant,
  onUpdateParticipant,
  onReorderParticipants,
  onDeleteParticipant,
  loading
}: ParticipantsListProps) {
  const [newParticipantName, setNewParticipantName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [stagedParticipants, setStagedParticipants] = useState<Participant[]>(participants);
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false); // New state for loading

  useEffect(() => {
    setStagedParticipants(participants);
  }, [participants]);
  
  // Removed sensors constant and useSensors call

  const handleAddParticipant = async () => {
    if (!newParticipantName.trim()) return;
    
    setIsAdding(true);
    try {
      await onAddParticipant(newParticipantName.trim());
      setNewParticipantName('');
    } catch (error) {
      console.error('Error adding participant:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddParticipant();
    }
  };

  // Removed handleDragEnd function

  const handleMoveUp = (participantId: number) => { // Removed async
    const index = stagedParticipants.findIndex(p => p.id === participantId);
    if (index > 0) { // Can't move up if already at the top
      const newParticipantsArray = [...stagedParticipants];
      const temp = newParticipantsArray[index];
      newParticipantsArray[index] = newParticipantsArray[index - 1];
      newParticipantsArray[index - 1] = temp;
      setStagedParticipants(newParticipantsArray);
      // Removed onReorderParticipants call
    }
  };

  const handleMoveDown = (participantId: number) => { // Removed async
    const index = stagedParticipants.findIndex(p => p.id === participantId);
    if (index < stagedParticipants.length - 1 && index !== -1) { // Can't move down if already at the bottom or not found
      const newParticipantsArray = [...stagedParticipants];
      const temp = newParticipantsArray[index];
      newParticipantsArray[index] = newParticipantsArray[index + 1];
      newParticipantsArray[index + 1] = temp;
      setStagedParticipants(newParticipantsArray);
      // Removed onReorderParticipants call
    }
  };

  const handleConfirmReorder = async () => {
    setIsConfirmingOrder(true);
    try {
      const participantIds = stagedParticipants.map(p => p.id);
      await onReorderParticipants(participantIds);
      // successful reorder will trigger useEffect to update stagedParticipants via props
    } catch (error) {
      console.error('Error confirming reorder:', error);
      // Optionally, show an error message to the user
    } finally {
      setIsConfirmingOrder(false);
    }
  };

  const handleCancelReorder = () => {
    setStagedParticipants(participants);
  };

  const originalOrderIds = JSON.stringify(participants.map(p => p.id));
  const stagedOrderIds = JSON.stringify(stagedParticipants.map(p => p.id));
  const hasStagedChanges = originalOrderIds !== stagedOrderIds;

  return (
    <Card className="card-coffee-accent">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Users className="h-5 w-5" />
            Participantes ({stagedParticipants.length}) {/* Use stagedParticipants length */}
          </CardTitle>
          <ReorderHistoryDialog participants={participants} /> {/* Still uses original participants */}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Info className="h-4 w-4" />
          <span>Use as setas para reordenar a sequência de compra</span> {/* Updated text */}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="participant-name">Adicionar novo participante</Label>
          <div className="flex gap-2">
            <Input
              id="participant-name"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nome do participante"
              disabled={isAdding}
            />
            <Button 
              onClick={handleAddParticipant}
              disabled={isAdding || !newParticipantName.trim()}
              size="icon"
              className="bg-amber-700 hover:bg-amber-800 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {stagedParticipants.length > 0 ? ( // Use stagedParticipants
          <div className="space-y-2">
            <Label>Lista de participantes (ordem de compra)</Label>
            {/* Removed DndContext and SortableContext wrappers */}
            <div className="grid gap-2">
              {stagedParticipants.map((participant, index) => ( // Use stagedParticipants, Added index for isFirst/isLast
                <ParticipantItem // Changed from SortableParticipantItem
                  key={participant.id}
                  participant={participant}
                  onUpdate={onUpdateParticipant}
                  onDelete={onDeleteParticipant}
                  onMoveUp={handleMoveUp} // Added prop
                  onMoveDown={handleMoveDown} // Added prop
                  isFirst={index === 0} // Added prop
                  isLast={index === stagedParticipants.length - 1} // Use stagedParticipants length
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Nenhum participante cadastrado
          </p>
        )}
        {hasStagedChanges && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={handleCancelReorder} // Assign handler
              size="sm"
              disabled={isConfirmingOrder} // Add disabled state
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmReorder} // Assign handler
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white min-w-[150px]" // Added min-width for consistent size
              disabled={isConfirmingOrder} // Add disabled state
            >
              {isConfirmingOrder ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" role="status" aria-label="loading"></span>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isConfirmingOrder ? 'Salvando...' : 'Confirmar Ordem'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Info, History } from 'lucide-react';
import { useState } from 'react';
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

  const handleMoveUp = async (participantId: number) => {
    const index = participants.findIndex(p => p.id === participantId);
    if (index > 0) { // Can't move up if already at the top
      const newParticipantsArray = [...participants];
      const temp = newParticipantsArray[index];
      newParticipantsArray[index] = newParticipantsArray[index - 1];
      newParticipantsArray[index - 1] = temp;

      const newParticipantIds = newParticipantsArray.map(p => p.id);
      try {
        await onReorderParticipants(newParticipantIds);
      } catch (error) {
        console.error('Error moving participant up:', error);
        // Consider adding user-facing error feedback if needed
      }
    }
  };

  const handleMoveDown = async (participantId: number) => {
    const index = participants.findIndex(p => p.id === participantId);
    if (index < participants.length - 1 && index !== -1) { // Can't move down if already at the bottom or not found
      const newParticipantsArray = [...participants];
      const temp = newParticipantsArray[index];
      newParticipantsArray[index] = newParticipantsArray[index + 1];
      newParticipantsArray[index + 1] = temp;

      const newParticipantIds = newParticipantsArray.map(p => p.id);
      try {
        await onReorderParticipants(newParticipantIds);
      } catch (error) {
        console.error('Error moving participant down:', error);
        // Consider adding user-facing error feedback if needed
      }
    }
  };

  return (
    <Card className="card-coffee-accent">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Users className="h-5 w-5" />
            Participantes ({participants.length})
          </CardTitle>
          <ReorderHistoryDialog participants={participants} />
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

        {participants.length > 0 ? (
          <div className="space-y-2">
            <Label>Lista de participantes (ordem de compra)</Label>
            {/* Removed DndContext and SortableContext wrappers */}
            <div className="grid gap-2">
              {participants.map((participant, index) => ( // Added index for isFirst/isLast
                <ParticipantItem // Changed from SortableParticipantItem
                  key={participant.id}
                  participant={participant}
                  onUpdate={onUpdateParticipant}
                  onDelete={onDeleteParticipant}
                  onMoveUp={handleMoveUp} // Added prop
                  onMoveDown={handleMoveDown} // Added prop
                  isFirst={index === 0} // Added prop
                  isLast={index === participants.length - 1} // Added prop
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Nenhum participante cadastrado
          </p>
        )}
      </CardContent>
    </Card>
  );
}

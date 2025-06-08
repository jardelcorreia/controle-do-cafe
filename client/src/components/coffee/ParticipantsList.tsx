import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Info, History } from 'lucide-react';
import { useState } from 'react';
import { ReorderHistoryDialog } from './ReorderHistoryDialog'; // Changed from ReorderHistoryDrawer
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Participant } from '@/types/coffee';
import { SortableParticipantItem } from './SortableParticipantItem';

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
  
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 85, // Requer 85px de movimento para ativar
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 500, // 500ms (suficiente para diferenciar toque normal)
      tolerance: 5, // Permite 5px de movimento durante o delay
    },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

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

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    // Ensure 'over' is not null and the item has moved to a different position
    if (over && active.id !== over.id) {
      const oldIndex = participants.findIndex(p => p.id === active.id);
      const newIndex = participants.findIndex(p => p.id === over.id); // 'over.id' is now safe

      // Ensure both items were found in the participants array
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(participants, oldIndex, newIndex);
        const participantIds = newOrder.map(p => p.id);

        try {
          await onReorderParticipants(participantIds);
        } catch (error) {
          // The error is already logged by useCoffeeData,
          // but you could add more specific UI feedback here if needed.
          console.error('Caught in ParticipantsList handleDragEnd:', error);
        }
      }
    }
    // If 'over' is null or item is dropped in the same place, do nothing.
  };

  return (
    <Card className="card-coffee-accent">
      <CardHeader>
        <div className="flex justify-between items-start"> {/* Flex container for title and button */}
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Users className="h-5 w-5" />
            Participantes ({participants.length})
          </CardTitle>
          <ReorderHistoryDialog participants={participants}> {/* Changed from ReorderHistoryDrawer */}
            <Button variant="ghost" size="icon" aria-label="Histórico de reordenação">
              H
            </Button>
          </ReorderHistoryDialog>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1"> {/* Added mt-1 for spacing */}
          <Info className="h-4 w-4" />
          <span>Arraste para reordenar a sequência de compra</span>
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
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={participants.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div className="grid gap-2">
                  {participants.map((participant) => (
                    <SortableParticipantItem
                      key={participant.id}
                      participant={participant}
                      onUpdate={onUpdateParticipant}
                      onDelete={onDeleteParticipant}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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

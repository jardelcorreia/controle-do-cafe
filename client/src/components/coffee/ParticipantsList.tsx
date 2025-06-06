import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Info } from 'lucide-react';
import { useState } from 'react';
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
      // Require the mouse to move by 5 pixels before activating
      activationConstraint: {
        distance: 5, // Keep desktop constraint
      },
    }),
    useSensor(TouchSensor), // TouchSensor without specific activation constraints
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

    if (active.id !== over?.id) {
      const oldIndex = participants.findIndex(p => p.id === active.id);
      const newIndex = participants.findIndex(p => p.id === over.id);
      
      const newOrder = arrayMove(participants, oldIndex, newIndex);
      const participantIds = newOrder.map(p => p.id);
      
      try {
        await onReorderParticipants(participantIds);
      } catch (error) {
        console.error('Error reordering participants:', error);
      }
    }
  };

  return (
    <Card className="card-coffee-accent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Users className="h-5 w-5" />
          Participantes ({participants.length})
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

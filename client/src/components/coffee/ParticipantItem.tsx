import { ChevronUp, ChevronDown } from 'lucide-react'; // Changed imports
import { Participant } from '@/types/coffee';
import { EditParticipantDialog } from './EditParticipantDialog';
import { DeleteParticipantDialog } from './DeleteParticipantDialog';
import { Button } from '@/components/ui/button'; // Added Button import

interface ParticipantItemProps { // Renamed interface
  participant: Participant;
  onUpdate: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onMoveUp: (id: number) => void; // Added prop
  onMoveDown: (id: number) => void; // Added prop
  isFirst: boolean; // Added prop
  isLast: boolean; // Added prop
}

export function ParticipantItem({
  participant,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: ParticipantItemProps) { // Renamed function and updated props

  // Removed useSortable hook and related variables (attributes, listeners, setNodeRef, transform, transition, isDragging)
  // Removed style object

  return (
    <div
      // Removed ref={setNodeRef} and style={style}
      className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800"
      // Removed isDragging conditional class
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Removed GripVertical div */}
        <div className="flex-1">
          <span className="font-medium">{participant.name}</span>
          <p className="text-sm text-muted-foreground">
            {new Date(participant.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
      <div className="flex gap-1 items-center"> {/* Changed gap to 1 and added items-center */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMoveUp(participant.id)}
          disabled={isFirst}
          aria-label="Mover para cima"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMoveDown(participant.id)}
          disabled={isLast}
          aria-label="Mover para baixo"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <EditParticipantDialog
          participant={participant}
          onUpdate={onUpdate}
        />
        <DeleteParticipantDialog
          participant={participant}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

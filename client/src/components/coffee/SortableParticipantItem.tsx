import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Participant } from '@/types/coffee';
import { EditParticipantDialog } from './EditParticipantDialog';
import { DeleteParticipantDialog } from './DeleteParticipantDialog';

interface SortableParticipantItemProps {
  participant: Participant;
  onUpdate: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function SortableParticipantItem({ participant, onUpdate, onDelete }: SortableParticipantItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: participant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <span className="font-medium">{participant.name}</span>
          <p className="text-sm text-muted-foreground">
            {new Date(participant.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
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

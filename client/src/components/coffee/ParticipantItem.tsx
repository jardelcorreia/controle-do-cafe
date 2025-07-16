import { ChevronUp, ChevronDown, User, Calendar } from 'lucide-react';
import { Participant } from '@/types/coffee';
import { EditParticipantDialog } from './EditParticipantDialog';
import { DeleteParticipantDialog } from './DeleteParticipantDialog';
import { Button } from '@/components/ui/button';

interface ParticipantItemProps {
  participant: Participant;
  onUpdate: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

export function ParticipantItem({
  participant,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: ParticipantItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="group relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-400 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-200/20 dark:bg-amber-800/20 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300" />

      <div className="relative p-4 flex items-center justify-between">
        {/* Participant info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <User className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {participant.id}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-lg truncate">
              {participant.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-600 dark:text-amber-400">
                Desde {formatDate(participant.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          {/* Movement buttons */}
          <div className="flex bg-white/50 dark:bg-black/20 rounded-lg p-1 backdrop-blur-sm border border-amber-200/30 dark:border-amber-800/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoveUp(participant.id)}
              disabled={isFirst}
              className="h-8 w-8 hover:bg-amber-100 dark:hover:bg-amber-900/50 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Mover para cima"
            >
              <ChevronUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoveDown(participant.id)}
              disabled={isLast}
              className="h-8 w-8 hover:bg-amber-100 dark:hover:bg-amber-900/50 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Mover para baixo"
            >
              <ChevronDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </Button>
          </div>

          {/* Edit and delete buttons */}
          <div className="flex gap-1 ml-2">
            <div className="[&>div>button]:h-8 [&>div>button]:w-8 [&>div>button]:bg-white/50 [&>div>button]:dark:bg-black/20 [&>div>button]:backdrop-blur-sm [&>div>button]:border [&>div>button]:border-amber-200/30 [&>div>button]:dark:border-amber-800/30 [&>div>button]:hover:bg-amber-100 [&>div>button]:dark:hover:bg-amber-900/50 [&>div>button]:text-amber-600 [&>div>button]:dark:text-amber-400">
              <EditParticipantDialog
                participant={participant}
                onUpdate={onUpdate}
              />
            </div>
            <div className="[&>div>button]:h-8 [&>div>button]:w-8 [&>div>button]:bg-white/50 [&>div>button]:dark:bg-black/20 [&>div>button]:backdrop-blur-sm [&>div>button]:border [&>div>button]:border-red-200/30 [&>div>button]:dark:border-red-800/30 [&>div>button]:hover:bg-red-100 [&>div>button]:dark:hover:bg-red-900/50 [&>div>button]:text-red-600 [&>div>button]:dark:text-red-400">
              <DeleteParticipantDialog
                participant={participant}
                onDelete={onDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

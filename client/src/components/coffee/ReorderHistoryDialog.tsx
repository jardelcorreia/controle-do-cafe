import React, { useState, useEffect, ReactNode } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'; // Changed from drawer to dialog
import { Button } from '@/components/ui/button';

interface Participant {
  id: number;
  name: string;
}

interface ReorderHistoryEntry {
  id: number;
  timestamp: string;
  old_order: string; // JSON string of participant IDs
  new_order: string; // JSON string of participant IDs
}

interface ReorderHistoryDialogProps { // Renamed from ReorderHistoryDrawerProps
  children: ReactNode;
  participants: Participant[]; // To map IDs to names
}

const mapIdsToNames = (idsJsonString: string, participants: Participant[]): string => {
  try {
    const ids = JSON.parse(idsJsonString) as number[];
    if (!Array.isArray(ids)) return 'Formato de ordem inválido';

    const participantMap = new Map(participants.map(p => [p.id, p.name]));
    return ids.map(id => participantMap.get(id) || `ID: ${id}`).join(', ');
  } catch (e) {
    console.error('Error parsing order JSON:', e);
    return 'Erro ao processar ordem';
  }
};

export function ReorderHistoryDialog({ children, participants }: ReorderHistoryDialogProps) { // Renamed function and prop type
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ReorderHistoryEntry[]>([]);
  // Note: isLoading and setError states are correctly defined below this in the actual file
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/reorder-history');
          if (!response.ok) {
            throw new Error(`Falha ao buscar histórico: ${response.statusText}`);
          }
          const data = await response.json();
          setHistory(data);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Ocorreu um erro desconhecido');
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[80vh] sm:max-w-[600px]"> {/* Adjusted width for dialog */}
        <DialogHeader>
          <DialogTitle>Histórico de Reordenação</DialogTitle>
          <DialogDescription>
            Veja as alterações anteriores na ordem dos participantes.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 overflow-y-auto"> {/* This div handles the scrolling content */}
          {isLoading && <p>Carregando histórico...</p>}
          {error && <p className="text-red-500">Erro: {error}</p>}
          {!isLoading && !error && history.length === 0 && (
            <p>Nenhum histórico de reordenação encontrado.</p>
          )}
          {!isLoading && !error && history.length > 0 && (
            <ul className="space-y-4">
              {history.map((entry) => (
                <li key={entry.id} className="p-3 border rounded-md bg-slate-50 dark:bg-slate-800">
                  <p className="text-sm font-medium">
                    Data: {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                  <div className="mt-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Ordem Anterior:</p>
                    <p className="text-sm">{mapIdsToNames(entry.old_order, participants)}</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Nova Ordem:</p>
                    <p className="text-sm">{mapIdsToNames(entry.new_order, participants)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

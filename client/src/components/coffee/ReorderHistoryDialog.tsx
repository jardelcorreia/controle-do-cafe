import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { Participant } from '@/types/coffee';
import { Badge } from '@/components/ui/badge';

interface ReorderHistoryEntry {
  id: number;
  timestamp: string;
  old_order: string;
  new_order: string;
}

interface ReorderHistoryDialogProps {
  participants: Participant[];
}

const mapIdsToNames = (idsJsonString: string, participants: Participant[]): { id: number, name: string }[] => {
  try {
    const ids = JSON.parse(idsJsonString) as number[];
    if (!Array.isArray(ids)) return [];
    const participantMap = new Map(participants.map(p => [p.id, p.name]));
    return ids.map(id => ({ id, name: participantMap.get(id) || `ID ${id}` }));
  } catch (e) {
    return [];
  }
};

export function ReorderHistoryDialog({ participants }: ReorderHistoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ReorderHistoryEntry[]>([]);
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
          setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido');
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50">
          <History className="h-5 w-5" />
          <span className="sr-only">Ver histórico de reordenação</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/50 border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full shadow-md">
              <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Histórico de Reordenação
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Veja as alterações anteriores na ordem dos participantes.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 my-4">
          {isLoading && <p className="text-center text-slate-600 dark:text-slate-400">Carregando histórico...</p>}
          {error && (
            <div className="flex flex-col items-center justify-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="font-semibold">Erro ao carregar</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {!isLoading && !error && history.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <History className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Nenhum histórico encontrado
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                As mudanças na ordem aparecerão aqui.
              </p>
            </div>
          )}
          {!isLoading && !error && history.length > 0 && (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="bg-white/50 dark:bg-black/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-4">
                  <div className="flex items-center gap-2 mb-3 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4"/>
                    <span>{new Date(entry.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">DE</p>
                      <div className="flex flex-wrap gap-1">
                        {mapIdsToNames(entry.old_order, participants).map(p => (
                          <Badge key={p.id} variant="secondary" className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">{p.name}</Badge>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase tracking-wider">PARA</p>
                      <div className="flex flex-wrap gap-1">
                        {mapIdsToNames(entry.new_order, participants).map(p => (
                          <Badge key={p.id} className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">{p.name}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Clock, Calendar, User, ExternalLink, AlertCircle } from 'lucide-react';
import { Purchase } from '@/types/coffee';
import { ClearHistoryDialog } from './ClearHistoryDialog';
import { DeletePurchaseDialog } from './DeletePurchaseDialog';

interface PurchaseHistoryProps {
  purchases: Purchase[];
  onClearHistory: () => Promise<void>;
  deletePurchase: (purchaseId: number, isExternal: boolean) => Promise<void>;
  purchasesError?: string | null;
}

export function PurchaseHistory({
  purchases,
  onClearHistory,
  deletePurchase,
  purchasesError,
}: PurchaseHistoryProps) {
  const hasPurchases = Array.isArray(purchases) && purchases.length > 0;
  const showError = !!purchasesError;

  const handleDelete = async (purchaseId: number, isExternal: boolean) => {
    try {
      await deletePurchase(purchaseId, isExternal);
    } catch (error) {
      console.error('Failed to delete purchase:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      dayOfWeek: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 dark:bg-blue-800/20 rounded-full -translate-y-16 translate-x-16" />

      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full shadow-md">
              <History className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="text-lg font-semibold">Histórico de compras</span>
              {hasPurchases && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {purchases.length} {purchases.length === 1 ? 'compra' : 'compras'}
                  </Badge>
                </div>
              )}
            </div>
          </CardTitle>
          {hasPurchases && !showError && (
            <ClearHistoryDialog
              onClearHistory={onClearHistory}
              purchaseCount={purchases.length}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="relative">
        {showError ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium">
              Erro ao carregar o histórico
            </p>
            <p className="text-red-500 dark:text-red-500 text-sm mt-1">
              {purchasesError}
            </p>
          </div>
        ) : !hasPurchases ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <History className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Nenhuma compra registrada
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
              As compras de café aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {purchases.map((purchase) => {
              const dateInfo = formatDate(purchase.purchase_date);
              return (
                <div
                  key={`${purchase.id}-${purchase.is_external}`}
                  className="group relative overflow-hidden bg-white/50 dark:bg-black/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-400 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center shadow-md">
                          {purchase.is_external ? (
                            <ExternalLink className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-blue-500 rounded-full text-white text-xs font-bold">
                          {dateInfo.relative}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {purchase.name}
                          </h3>
                          {purchase.is_external && (
                            <Badge variant="outline" className="text-xs border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400">
                              Externo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{dateInfo.dayOfWeek}, {dateInfo.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{dateInfo.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                      <DeletePurchaseDialog
                        purchaseName={purchase.name}
                        purchaseDate={`${dateInfo.date} às ${dateInfo.time}`}
                        onConfirmDelete={() => handleDelete(purchase.id, purchase.is_external)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
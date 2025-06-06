import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coffee, User } from 'lucide-react';
import { NextBuyerResponse } from '@/types/coffee';

interface NextBuyerCardProps {
  nextBuyer: NextBuyerResponse | null;
  onRecordPurchase: (participantId: number) => Promise<void>;
  loading?: boolean;
}

export function NextBuyerCard({ nextBuyer, onRecordPurchase, loading }: NextBuyerCardProps) {
  const handleRecordPurchase = async () => {
    if (nextBuyer?.next_buyer) {
      await onRecordPurchase(nextBuyer.next_buyer.id);
    }
  };

  if (!nextBuyer) {
    return (
      <Card className="card-coffee-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Coffee className="h-5 w-5" />
            Próximo a comprar café
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!nextBuyer.next_buyer) {
    return (
      <Card className="card-coffee-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Coffee className="h-5 w-5" />
            Próximo a comprar café
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {nextBuyer.message || 'Nenhum participante encontrado'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-coffee-accent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Coffee className="h-5 w-5" />
          Próximo a comprar café
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
            <User className="h-6 w-6 text-amber-700 dark:text-amber-300" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              {nextBuyer.next_buyer.name}
            </p>
            <p className="text-sm text-muted-foreground">
              É a sua vez!
            </p>
          </div>
        </div>

        {nextBuyer.last_purchase && (
          <div className="text-sm text-muted-foreground">
            <p>
              Última compra: <strong>{nextBuyer.last_purchase.name}</strong>
            </p>
            <p>
              {new Date(nextBuyer.last_purchase.purchase_date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        <Button 
          onClick={handleRecordPurchase}
          disabled={loading}
          className="w-full bg-amber-700 hover:bg-amber-800 text-white"
        >
          {loading ? 'Registrando...' : 'Marcar como comprado'}
        </Button>
      </CardContent>
    </Card>
  );
}

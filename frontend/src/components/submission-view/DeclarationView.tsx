import { Card, CardContent } from '../ui/card';
import { CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface DeclarationViewProps {
  children: ReactNode;
}

export function DeclarationView({ children }: DeclarationViewProps) {
  return (
    <Card className="border-2 border-blue-60 bg-blue-50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Declaration</h3>
          <div className="p-4 rounded-md">
            {children}
          </div>
          <div className="flex items-start space-x-3 pt-2 bg-white p-3 rounded-md border border-green-200">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-semibold text-slate-900">
              Doctor has declared that all of the above is true.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

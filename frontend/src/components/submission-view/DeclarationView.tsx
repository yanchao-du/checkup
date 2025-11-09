import { Card, CardContent } from '../ui/card';
import { CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface DeclarationViewProps {
  children: ReactNode;
  doctorName?: string;
  doctorMcrNumber?: string;
  clinicName?: string;
  clinicHciCode?: string;
  clinicPhone?: string;
  status?: string;
}

export function DeclarationView({ children, doctorName, doctorMcrNumber, clinicName, clinicHciCode, clinicPhone, status }: DeclarationViewProps) {
  return (
    <Card className="border-2 border-blue-60 bg-blue-50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Declaration</h3>
          
          {/* Doctor Information Display */}
          {doctorName && (
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">{status === 'pending_approval' ? 'Prepared by' : 'Examining Doctor'}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Name:</span>
                  <span className="text-gray-900">{doctorName}</span>
                </div>
                {doctorMcrNumber && (
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-24">MCR Number:</span>
                    <span className="text-gray-900">{doctorMcrNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clinic Information Display */}
          {clinicName && (
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">Clinic Information</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Name:</span>
                  <span className="text-gray-900">{clinicName}</span>
                </div>
                {clinicHciCode && (
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-24">HCI Code:</span>
                    <span className="text-gray-900">{clinicHciCode}</span>
                  </div>
                )}
                {clinicPhone && (
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-24">Phone:</span>
                    <span className="text-gray-900">{clinicPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-4 rounded-md">
            {children}
          </div>
          <div className="flex items-start space-x-3 pt-2 bg-white p-3 rounded-md border border-green-200">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-semibold text-slate-900">
              Declared that all of the above is true.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

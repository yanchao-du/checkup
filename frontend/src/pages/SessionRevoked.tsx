import { AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export function SessionRevoked() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-4">
            Session Revoked
          </h1>
          
          <div className="space-y-4 text-slate-700 mb-6">
            <p className="text-center">
              Your session has been ended because you logged in from another location or device.
            </p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm">
                <strong>For security reasons:</strong>
              </p>
              <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                <li>Only one active session is allowed per user</li>
                <li>Logging in from a new location ends your previous session</li>
                <li>This helps protect your account from unauthorized access</li>
              </ul>
            </div>
            
            <p className="text-center text-sm">
              If this wasn't you, please contact your administrator immediately.
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/')}
            className="w-full"
          >
            Return to Login
          </Button>
        </div>
      </div>
    </div>
  );
}

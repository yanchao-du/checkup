import { Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SgdsMasthead } from '@govtechsg/sgds-web-component/react';
import SgdsFooter from '@govtechsg/sgds-web-component/react/footer/index.js';
import '@govtechsg/sgds-web-component/themes/day.css';
import '@govtechsg/sgds-web-component/css/sgds.css';
import '@govtechsg/sgds-web-component';

export function SessionExpired() {
  const navigate = useNavigate();

  return (
    <>
      <SgdsMasthead />
      <div className="min-h-screen bg-slate-50">
        {/* Header with CheckUp logo */}
        <div className="bg-white border-b border-slate-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="goCheckUp logo" className="w-12 h-12" />
              <h1 className="text-2xl font-bold text-slate-900">
                <span style={{ color: '#0ea5a4' }}>go</span>CheckUp
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <Clock className="w-10 h-10 text-amber-600" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-center text-slate-900 mb-4">
                Session Expired
              </h1>
              
              <div className="space-y-4 text-slate-700 mb-6">
                <p className="text-center">
                  You've been logged out due to inactivity.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm">
                    For your security, sessions automatically expire after a period of inactivity.
                  </p>
                </div>
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
      </div>
      <SgdsFooter />
    </>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

/**
 * Authentication Error Page
 * Displays user-friendly error messages for CorpPass and other auth failures
 */
export function AuthError() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const message = searchParams.get('message');
    
    if (message) {
      setErrorMessage(message);
    } else {
      setErrorMessage('An authentication error occurred. Please try again.');
    }
  }, [searchParams]);

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-4">
            Authentication Failed
          </h1>

          {/* Error Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 text-center">
              {errorMessage}
            </p>
          </div>

          {/* Help Text */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-slate-900 mb-2">What should I do?</h2>
            <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside">
              <li>If your account is pending approval, please contact your administrator</li>
              <li>If your account is inactive, please reach out to support</li>
              <li>You can try logging in again using the button below</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-2">Need Help?</h2>
            <p className="text-sm text-blue-800">
              Contact your system administrator or IT support team for assistance with account access.
            </p>
          </div>

          {/* Back to Login Button */}
          <button
            onClick={handleBackToLogin}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Login Page
          </button>

          {/* Footer */}
          <p className="text-xs text-slate-500 text-center mt-6">
            If this problem persists, please contact your administrator
          </p>
        </div>
      </div>
    </div>
  );
}

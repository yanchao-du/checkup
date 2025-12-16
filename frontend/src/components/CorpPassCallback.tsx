import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import logger from '../utils/logger';

/**
 * CorpPass OAuth Callback Handler
 * This component handles the redirect from CorpPass after authentication
 */
export function CorpPassCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token and user data from URL params
        const token = searchParams.get('token');
        const userJson = searchParams.get('user');

        if (!token || !userJson) {
          toast.error('CorpPass authentication failed. Missing token or user data.');
          navigate('/login');
          return;
        }

        // Parse user data
        const user = JSON.parse(userJson);

        // Store token in localStorage
        localStorage.setItem('token', token);

        // Update auth context
        setUser(user);

        toast.success(`Welcome back, ${user.name}!`);
        
        // Redirect to dashboard
        navigate('/');
      } catch (error) {
        logger.error('CorpPass callback error:', error);
        toast.error('Failed to complete CorpPass login. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Completing CorpPass Login</h2>
        <p className="text-slate-600">Please wait while we verify your credentials...</p>
      </div>
    </div>
  );
}

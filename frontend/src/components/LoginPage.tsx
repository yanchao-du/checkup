import { useState } from 'react';
import { SgdsMasthead } from '@govtechsg/sgds-web-component/react';
import SgdsFooter  from "@govtechsg/sgds-web-component/react/footer/index.js";
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Shield, Loader2 } from 'lucide-react';
import "@govtechsg/sgds-web-component/themes/day.css";
import "@govtechsg/sgds-web-component/css/sgds.css";
import "@govtechsg/sgds-web-component";

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  // Feature toggle for email/password login
  const enableEmailLogin = import.meta.env.VITE_ENABLE_EMAIL_LOGIN === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login successful');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SgdsMasthead />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <img src="/logo.svg" alt="goCheckUp logo" className="w-16 h-16" />
            </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">goCheckUp Medical Examination Portal</h1>
          <p className="text-slate-600">A one-stop portal to submit statutory medical examinations to government agencies</p>
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-900 text-sm font-semibold">
            This website is for demo and testing purposes only. Do not submit real patient data.
          </div>
        </div>

        <Card>
          <CardHeader>
            {/* <CardTitle>Sign In</CardTitle> */}
            {/* <CardDescription>Enter your credentials to access the portal</CardDescription> */}
          </CardHeader>
          <CardContent>
            {enableEmailLogin && (
              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@clinic.sg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            )}
            {/* CorpPass Login Button */}
            <Button
              type="button"
              // variant="primary"
              className="w-full"
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_API_URL}/auth/corppass/authorize`;
              }}
            >
              {/* <Shield className="w-4 h-4 mr-2" /> */}
              Login with CorpPass
            </Button>

            {/* <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-semibold text-slate-600 mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-slate-500">
                <p className="text-sm">Doctor: doctor@clinic.sg / S1234567D</p>
                <p className="text-sm">Nurse: nurse@clinic.sg / S2345678H</p>
                <p className="text-sm">Admin: admin@clinic.sg / S3456789A</p>
                <p className="text-sm">Nurse 2: nurse2@clinic.sg / S7890123C</p>
                <p className="text-sm">UEN: 123456789D</p>
                <p className="text-sm mb-2">Password: password</p>
              </div>
            </div> */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-semibold text-slate-600 mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-slate-500">
                <p className="text-sm">Doctor1: S1234567D</p>
                <p className="text-sm">Doctor2: S4567890C</p>
                <p className="text-sm">Nurse/Assistant1: S2345678H</p>
                <p className="text-sm">Nurse/Assistant2: S7890123C</p>
                {/* <p className="text-sm">Admin1: S3456789A</p> */}
                <p className="text-sm">UEN: 123456789D</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Shield className="w-4 h-4" />
          <span>Secure government portal</span>
        </div> */}
      </div>
  </div>
  <SgdsFooter />
  </>
  );
}

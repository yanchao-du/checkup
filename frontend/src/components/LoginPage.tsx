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
              <img src="/logo.svg" alt="CheckUp logo" className="w-16 h-16" />
            </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">CheckUp Medical Portal</h1>
          <p className="text-slate-600">Submit medical examinations to Singapore government agencies</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* OR Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* CorpPass Login Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                // Use Vite's import.meta.env and a template literal so the variable is interpolated
                window.location.href = `${import.meta.env.VITE_API_URL}/auth/corppass/authorize`;
              }}
            >
              <Shield className="w-4 h-4 mr-2" />
              Login with CorpPass
            </Button>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-slate-500">
                <p>Doctor: doctor@clinic.sg</p>
                <p>Nurse: nurse@clinic.sg</p>
                <p>Admin: admin@clinic.sg</p>
                <p className="mt-2">Password: password</p>
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

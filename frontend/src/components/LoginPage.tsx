import { useState } from 'react';
import { SgdsMasthead } from '@govtechsg/sgds-web-component/react';
import SgdsFooter  from "@govtechsg/sgds-web-component/react/footer/index.js";
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Shield, Loader2, FileCheck, Users, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import "@govtechsg/sgds-web-component/themes/day.css";
import "@govtechsg/sgds-web-component/css/sgds.css";
import "@govtechsg/sgds-web-component";

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
        {/* Hero Section with Login */}
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
            
            {/* Left Column - Overview */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.svg" alt="goCheckUp logo" className="w-16 h-16" />
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                  <span style={{ color: '#0ea5a4' }}>go</span>CheckUp
                </h1>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl lg:text-3xl font-semibold text-slate-900">
                  Medical Examination Portal
                </h2>
                <p className="text-lg text-slate-700">
                  A one-stop portal for healthcare institutions to manage, submit, and track statutory medical examinations efficiently and securely.
                </p>
              </div>

              {/* Warning Banner */}
              {/* <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded">
                <p className="text-yellow-900 font-semibold text-sm">
                  ⚠️ Demo Environment: Do not submit real patient data
                </p>
              </div> */}

              {/* Key Features */}
              <div className="space-y-6 pt-6">
                <h3 className="text-lg font-semibold text-slate-900">Key Features</h3>
                <div className="grid gap-6">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <FileCheck className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Multiple Exam Types, One Single Portal</h4>
                      <p className="text-sm text-slate-600">Submit results for Work Permit, Driver Licence, and other statutory exams across agencies such as MOM, SPF, LTA, ICA, and more — all in one place.</p>
                    </div>
                  </div>
                  
                  {/* <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Users className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Role-Based Workflow</h4>
                      <p className="text-sm text-slate-600">Separate access for nurses, doctors, and administrators</p>
                    </div>
                  </div> */}
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Clock className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Real-Time Tracking</h4>
                      <p className="text-sm text-slate-600">Monitor submission status from draft to approval</p>
                    </div>
                  </div>
                  
                  {/* <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Secure & Compliant</h4>
                      <p className="text-sm text-slate-600">CorpPass authentication and audit trails</p>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Right Column - Login Card */}
            <div className="lg:sticky lg:top-8">
              <Card className="shadow-xl min-h-[500px]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Access the portal with your CorpPass credentials</CardDescription>
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

            {/* Collapsible Demo Accounts */}
            <div className="mt-6">
              <button
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="w-full flex items-center justify-between p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
              >
                <span className="text-sm font-semibold text-teal-900">Demo Accounts</span>
                {showDemoAccounts ? (
                  <ChevronUp className="w-4 h-4 text-teal-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-teal-700" />
                )}
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showDemoAccounts ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200 space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-teal-900">Doctor Accounts:</p>
                    <p className="text-sm text-slate-700 ml-2">• Doctor1: S1234567D</p>
                    <p className="text-sm text-slate-700 ml-2">• Doctor2: S4567890C</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-teal-900">Nurse/Assistant Accounts:</p>
                    <p className="text-sm text-slate-700 ml-2">• Nurse/Assistant1: S2345678H</p>
                    <p className="text-sm text-slate-700 ml-2">• Nurse/Assistant2: S7890123C</p>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-teal-200">
                    <p className="text-sm font-medium text-teal-900">UEN: 123456789D</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-white border-t border-slate-200 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Supported Examination Types</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-sm font-medium text-slate-700">Full Medical Examination for Foreign Worker</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-sm font-medium text-slate-700">6ME for Migrant Domestic Worker</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-sm font-medium text-slate-700">6ME for Female Migrant Worker</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-sm font-medium text-slate-700">Medical Examination for Permanant Residency</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-sm font-medium text-slate-700">Medical Examination for Long Term Visit Pass</p>
                </div>
                                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-sm font-medium text-slate-700">Medical Examination for Student Pass</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-sm font-medium text-slate-700">Medical Examination for Driving Licence / Vocational Licence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SgdsFooter />
    </>
  );
}

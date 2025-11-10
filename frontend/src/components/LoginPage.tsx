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
                      {/* <p className="text-sm text-slate-600">Submit results for Work Permit, Driver Licence, and other statutory exams across agencies such as MOM, SPF, LTA, ICA, and more — all in one place.</p> */}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Users className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Role-Based Workflow</h4>
                      {/* <p className="text-sm text-slate-600">Separate access for nurses, doctors, and administrators</p> */}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Clock className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Real-Time Tracking</h4>
                      {/* <p className="text-sm text-slate-600">Monitor submission status from draft to approval</p> */}
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
            <div className="lg:sticky lg:top-16">
              <Card className="shadow-xl">
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
                  showDemoAccounts ? 'h-auto opacity-100 mt-2' : 'h-0 opacity-0'
                }`}
              >
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {/* Doctors Column */}
                    <div>
                      <p className="text-sm font-semibold text-teal-900 mb-2">Doctors</p>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-700">Dr. Sarah Tan</p>
                        <p className="text-xs text-teal-700">S1234567D</p>
                      </div>
                      <div className="space-y-1 mt-2">
                        <p className="text-xs text-slate-700">Dr. James Lee</p>
                        <p className="text-xs text-teal-700">S4567890C</p>
                      </div>
                    </div>
                    
                    {/* Nurses Column */}
                    <div>
                      <p className="text-sm font-semibold text-teal-900 mb-2">Nurses</p>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-700">Nurse Mary Lim</p>
                        <p className="text-xs text-teal-700">S2345678H</p>
                      </div>
                      <div className="space-y-1 mt-2">
                        <p className="text-xs text-slate-700">Nurse Linda Koh</p>
                        <p className="text-xs text-teal-700">S7890123C</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-teal-200">
                    <p className="text-xs font-semibold text-teal-900">Clinic UEN: <span className="font-normal">123456789D</span></p>
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
        <div className="bg-white border-t border-slate-200 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <h3 className="text-2xl font-semibold text-slate-900 mb-8 text-center">Supported Examination Types</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* MOM */}
                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <h4 className="text-lg font-semibold text-teal-700 mb-4">Ministry of Manpower (MOM)</h4>
                  <ul className="space-y-2">
                    <li className="text-sm text-slate-700 flex items-start">
                      <span className="text-teal-600 mr-2">•</span>
                      <span>Full Medical Examination for Foreign Worker</span>
                    </li>
                    <li className="text-sm text-slate-700 flex items-start">
                      <span className="text-teal-600 mr-2">•</span>
                      <span>6-Monthly Medical Examination for Migrant Domestic Worker</span>
                    </li>
                    <li className="text-sm text-slate-700 flex items-start">
                      <span className="text-teal-600 mr-2">•</span>
                      <span>6-Monthly Medical Examination for Female Migrant Worker</span>
                    </li>
                  </ul>
                </div>

                {/* ICA */}
                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <h4 className="text-lg font-semibold text-teal-700 mb-4">Immigration & Checkpoints Authority (ICA)</h4>
                  <ul className="space-y-2">
                    <li className="text-sm text-slate-700 flex items-start">
                      <span className="text-teal-600 mr-2">•</span>
                      <span>Medical Examination for Permanent Residency</span>
                    </li>
                    <li className="text-sm text-slate-700 flex items-start">
                      <span className="text-teal-600 mr-2">•</span>
                      <span>Medical Examination for Long Term Visit Pass</span>
                    </li>
                    <li className="text-sm text-slate-700 flex items-start">
                      <span className="text-teal-600 mr-2">•</span>
                      <span>Medical Examination for Student Pass</span>
                    </li>
                  </ul>
                </div>

                {/* Traffic Police */}
                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <h4 className="text-lg font-semibold text-teal-700 mb-4">Singapore Police Force (SPF) and Land Transport Authority (LTA)</h4>
                  <ul className="space-y-2">
                    <li className="text-sm text-slate-700 flex items-start">
                      <span className="text-teal-600 mr-2">•</span>
                      <span>Medical Examination for Driving Licence / Vocational Licence</span>
                    </li>
                    {/* <li className="text-sm text-slate-700 flex items-start">
                      <span className="text-teal-600 mr-2">•</span>
                      <span>Medical Examination for Vocational Licence</span>
                    </li> */}
                  </ul>
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

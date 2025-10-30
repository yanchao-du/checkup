import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissionsApi } from '../services/submissions.service';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

export function Acknowledgement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await submissionsApi.getById(id);
        setSubmission(data);
      } catch (err) {
        console.error('Failed to load submission for acknowledgement', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  // When the acknowledgement is shown (submission loaded), ensure page is scrolled to top
  useEffect(() => {
    if (submission) {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        // fallback for older browsers
        window.scrollTo(0, 0);
      }
    }
  }, [submission]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Acknowledgement not available</p>
        <div className="mt-4">
          <Button onClick={() => navigate('/submissions')}>Back to Submissions</Button>
        </div>
      </div>
    );
  }

  const submittedAt = submission.submittedDate ? new Date(submission.submittedDate) : new Date(submission.createdDate);

  return (
    <div className="max-w-3xl mx-auto py-12">
      <Card>
        <CardHeader className="pt-6">
          {/* Inline small icon and prominent message */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-lg md:text-xl font-semibold text-slate-900">Medical examination results have been successfully submitted.</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* main message already displayed in header */}

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="pl-3 md:pl-4">
                  <p className="text-xs text-slate-500">NRIC / FIN</p>
                  <p className="text-slate-900 font-medium">{submission.patientNric || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Patient Name</p>
                  <p className="text-slate-900 font-medium">{submission.patientName || '-'}</p>
                </div>
                <div className="pl-3 md:pl-4">
                  <p className="text-xs text-slate-500">Reference Number</p>
                  <p className="text-slate-900 font-medium">{submission.id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date & Time</p>
                  <p className="text-slate-900 font-medium">{submittedAt.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">What do you want to do next?</h4>
              <ul className="list-disc pl-5">
                <li>
                  <Link to="/new-submission" className="text-blue-600 hover:underline">Start a new submission</Link>
                </li>
                <li>
                  <Link to="/submissions" className="text-blue-600 hover:underline">View submissions</Link>
                </li>
              </ul>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

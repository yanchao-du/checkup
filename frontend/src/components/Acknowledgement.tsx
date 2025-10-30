import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissionsApi } from '../services/submissions.service';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

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
        <CardHeader>
          <CardTitle>Acknowledgement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Thank you. The medical submission has been successfully submitted to the agency.</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">NRIC / FIN</p>
                <p className="text-slate-900 font-medium">{submission.patientNric || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Patient Name</p>
                <p className="text-slate-900 font-medium">{submission.patientName || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Reference Number</p>
                <p className="text-slate-900 font-medium">{submission.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Date & Time</p>
                <p className="text-slate-900 font-medium">{submittedAt.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => navigate('/submissions')}>Back to Submissions</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { approvalsApi, submissionsApi } from '../services';
import type { MedicalSubmission } from '../services';
import { formatExamType } from '../lib/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { XCircle, Eye, Loader2, RotateCcw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export function RejectedSubmissions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rejectedSubmissions, setRejectedSubmissions] = useState<MedicalSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reopeningId, setReopeningId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRejectedSubmissions = async () => {
      try {
        setIsLoading(true);
        // Doctors use approvals endpoint, nurses use submissions endpoint
        const response = user?.role === 'doctor' 
          ? await approvalsApi.getRejected({ page: 1, limit: 100 })
          : await submissionsApi.getRejected({ page: 1, limit: 100 });
        setRejectedSubmissions(response.data);
      } catch (error) {
        console.error('Failed to fetch rejected submissions:', error);
        toast.error('Failed to load rejected submissions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRejectedSubmissions();
  }, [user?.role]);

  const handleReopen = async (submissionId: string) => {
    try {
      setReopeningId(submissionId);
      await submissionsApi.reopenSubmission(submissionId);
      toast.success('Submission reopened and moved to drafts');
      // Redirect to draft edit page
      navigate(`/draft/${submissionId}`);
    } catch (error) {
      console.error('Failed to reopen submission:', error);
      toast.error('Failed to reopen submission');
    } finally {
      setReopeningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-600" />
        <p className="text-slate-600">Loading rejected submissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-1">Rejected Submissions</h2>
        <p className="text-slate-600">
          {user?.role === 'doctor' 
            ? 'Review submissions you have rejected'
            : 'Review your submissions that were rejected'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rejected Medical Examinations ({rejectedSubmissions.length})</CardTitle>
          <CardDescription>
            {user?.role === 'doctor'
              ? 'Submissions that were rejected and returned to drafts'
              : 'Your submissions that were rejected by doctors'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rejectedSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Rejected Submissions</h3>
              <p className="text-sm mt-1">You haven't rejected any submissions yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>NRIC/FIN</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Rejection Reason</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Rejected By</TableHead>
                  <TableHead>Rejected Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rejectedSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.patientName}</TableCell>
                    <TableCell>{submission.patientNric}</TableCell>
                    <TableCell className="text-sm">{formatExamType(submission.examType)}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-slate-600 truncate" title={submission.rejectedReason}>
                        {submission.rejectedReason || 'No reason provided'}
                      </p>
                    </TableCell>
                    <TableCell>{submission.createdByName}</TableCell>
                    <TableCell>{submission.approvedByName || 'Unknown'}</TableCell>
                    <TableCell>
                      {new Date(submission.createdDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Rejected
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/view-submission/${submission.id}`}>
                          <button className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </Link>
                        {user?.role === 'nurse' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReopen(submission.id)}
                            disabled={reopeningId === submission.id}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            {reopeningId === submission.id ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Reopening...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Reopen
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

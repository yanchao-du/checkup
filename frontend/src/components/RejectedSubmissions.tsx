import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { approvalsApi } from '../services';
import type { MedicalSubmission } from '../services';
import { formatExamType } from '../lib/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { XCircle, Eye, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { toast } from 'sonner';

export function RejectedSubmissions() {
  const [rejectedSubmissions, setRejectedSubmissions] = useState<MedicalSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRejectedSubmissions = async () => {
      try {
        setIsLoading(true);
        const response = await approvalsApi.getRejected({ page: 1, limit: 100 });
        setRejectedSubmissions(response.data);
      } catch (error) {
        console.error('Failed to fetch rejected submissions:', error);
        toast.error('Failed to load rejected submissions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRejectedSubmissions();
  }, []);

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
        <p className="text-slate-600">Review submissions you have rejected</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rejected Medical Examinations ({rejectedSubmissions.length})</CardTitle>
          <CardDescription>
            Submissions that were rejected and returned to drafts
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
                      <Link to={`/view-submission/${submission.id}`}>
                        <button className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </Link>
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

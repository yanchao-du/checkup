import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { approvalsApi, submissionsApi } from '../services';
import type { MedicalSubmission } from '../services';
import { formatExamType } from '../lib/formatters';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { XCircle, Eye, Loader2, RotateCcw, Search, ArrowUpDown } from 'lucide-react';
import { ExamTypeFilter } from './ExamTypeFilter';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExamType, setFilterExamType] = useState<string>('all');
  const [reopeningId, setReopeningId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof MedicalSubmission | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const filteredRejections = rejectedSubmissions.filter(submission => {
    const matchesSearch = 
      submission.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.patientNric.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesExamType = filterExamType === 'all' || submission.examType === filterExamType;
    
    return matchesSearch && matchesExamType;
  });

  const handleSort = (field: keyof MedicalSubmission) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRejections = [...filteredRejections].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleReopen = async (submissionId: string) => {
    try {
      setReopeningId(submissionId);
      await submissionsApi.reopenSubmission(submissionId);
      toast.success('Submission reopened - you can now edit it');
      
      // Refresh the list to show updated status
      const response = user?.role === 'doctor' 
        ? await approvalsApi.getRejected({ page: 1, limit: 100 })
        : await submissionsApi.getRejected({ page: 1, limit: 100 });
      setRejectedSubmissions(response.data);
      
      // Redirect to draft edit page after a brief delay
      setTimeout(() => navigate(`/draft/${submissionId}`), 1000);
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
        <h2 className="text-slate-900 mb-1 text-2xl font-semibold">Rejected Submissions</h2>
        <p className="text-slate-600">
          {user?.role === 'doctor' 
            ? 'Review submissions you have rejected'
            : 'Review your submissions that were rejected'}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {/* <Label className="text-base font-semibold">Search Rejected Submissions</Label> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by patient name or NRIC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2">
              <ExamTypeFilter value={filterExamType} onValueChange={setFilterExamType} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="my-4">
            <Label className="text-base font-semibold">Rejected Medical Examinations ({sortedRejections.length})</Label>
          </div>
          {sortedRejections.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Rejected Submissions Found</h3>
              {searchQuery && <p className="text-sm mt-1">Try adjusting your search</p>}
              {!searchQuery && <p className="text-sm mt-1">You haven't rejected any submissions yet</p>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('patientName')}
                      className="h-8 px-2 hover:bg-slate-100 font-semibold"
                    >
                      Patient Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('patientNric')}
                      className="h-8 px-2 hover:bg-slate-100 font-semibold"
                    >
                      NRIC/FIN
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('examType')}
                      className="h-8 px-2 hover:bg-slate-100 font-semibold"
                    >
                      Exam Type
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('rejectedReason')}
                      className="h-8 px-2 hover:bg-slate-100 font-semibold"
                    >
                      Rejection Reason
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('createdByName')}
                      className="h-8 px-2 hover:bg-slate-100 font-semibold"
                    >
                      Submitted By
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('approvedByName')}
                      className="h-8 px-2 hover:bg-slate-100 font-semibold"
                    >
                      Rejected By
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('createdDate')}
                      className="h-8 px-2 hover:bg-slate-100 font-semibold"
                    >
                      Rejected Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('status')}
                      className="h-8 px-2 hover:bg-slate-100 font-semibold"
                    >
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRejections.map((submission) => (
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
                      {submission.status === 'draft' ? (
                        <div className="flex gap-1">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Reopened
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Rejected
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/view-submission/${submission.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-1.5" />
                            View
                          </Button>
                        </Link>
                        {user?.role === 'nurse' && submission.status === 'rejected' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReopen(submission.id)}
                            disabled={reopeningId === submission.id}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            {reopeningId === submission.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                Reopening...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-4 h-4 mr-1.5" />
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

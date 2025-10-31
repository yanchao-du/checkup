import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { submissionsApi } from '../services/submissions.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Loader2, Eye, FileText, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { getSubmissionStatusBadgeVariant, getSubmissionStatusLabel } from '../lib/badge-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export function SubmissionsList() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterExamType, setFilterExamType] = useState<string>('all');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        const response = await submissionsApi.getAll();
        setSubmissions(response.data);
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Backend already filters by createdBy OR approvedBy for doctors
  // So we don't need to filter again on the frontend
  const mySubmissions = submissions;

  const filteredSubmissions = mySubmissions.filter((submission: any) => {
    const matchesSearch = 
      submission.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.patientNric.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    const matchesExamType = filterExamType === 'all' || submission.examType === filterExamType;

    return matchesSearch && matchesStatus && matchesExamType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-1 text-2xl font-semibold">Medical Examinations</h2>
        <p className="text-slate-600">View and search all submitted medical examinations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search and filter your completed submissions</CardTitle>
          <CardDescription>Find submissions by patient name, NRIC, status, or exam type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by patient name or NRIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {/* <label className="text-sm text-slate-700">Status</label> */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {/* <label className="text-sm text-slate-700">Exam Type</label> */}
              <Select value={filterExamType} onValueChange={setFilterExamType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exam Types</SelectItem>
                  <SelectItem value="SIX_MONTHLY_MDW">
                    MDW Six-monthly (MOM)
                  </SelectItem>
                  <SelectItem value="SIX_MONTHLY_FMW">
                    FMW Six-monthly (MOM)
                  </SelectItem>
                  <SelectItem value="WORK_PERMIT">
                    Work Permit (MOM)
                  </SelectItem>
                  <SelectItem value="AGED_DRIVERS">
                    Aged Drivers (SPF)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results ({filteredSubmissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-600" />
              <p className="text-slate-600">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No submissions found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>NRIC/FIN</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission: any) => (
                    <TableRow 
                      key={submission.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(`/view-submission/${submission.id}`, { state: { from: '/submissions' } })}
                    >
                      <TableCell>{submission.patientName}</TableCell>
                      <TableCell className="text-slate-600">{submission.patientNric}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {submission.examType === 'SIX_MONTHLY_MDW' && 'MDW Six-monthly (MOM)'}
                          {submission.examType === 'SIX_MONTHLY_FMW' && 'FMW Six-monthly (MOM)'}
                          {submission.examType === 'WORK_PERMIT' && 'Work Permit (MOM)'}
                          {submission.examType === 'AGED_DRIVERS' && 'Aged Drivers (SPF)'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getSubmissionStatusBadgeVariant(submission.status)}
                        >
                          {getSubmissionStatusLabel(submission.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{submission.createdByName}</TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(submission.submittedDate || submission.createdDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link to={`/view-submission/${submission.id}`} state={{ from: '/submissions' }}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-1.5" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

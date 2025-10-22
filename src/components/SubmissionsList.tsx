import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useMockData } from './useMockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { FileText, Search, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export function SubmissionsList() {
  const { user } = useAuth();
  const { submissions } = useMockData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterExamType, setFilterExamType] = useState<string>('all');

  const mySubmissions = user?.role === 'admin'
    ? submissions
    : submissions.filter(s => s.createdBy === user?.id);

  const filteredSubmissions = mySubmissions.filter(submission => {
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
        <h2 className="text-slate-900 mb-1">Submissions</h2>
        <p className="text-slate-600">View and search all submitted medical examinations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Submissions</CardTitle>
          <CardDescription>Search and filter your medical exam submissions</CardDescription>
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
              <label className="text-sm text-slate-700">Status</label>
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
              <label className="text-sm text-slate-700">Exam Type</label>
              <Select value={filterExamType} onValueChange={setFilterExamType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Six-monthly Medical Exam for Migrant Domestic Workers (MOM)">
                    MDW Six-monthly (MOM)
                  </SelectItem>
                  <SelectItem value="Full Medical Exam for Work Permit (MOM)">
                    Work Permit (MOM)
                  </SelectItem>
                  <SelectItem value="Medical Exam for Aged Drivers (SPF)">
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
          {filteredSubmissions.length === 0 ? (
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
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.patientName}</TableCell>
                      <TableCell className="text-slate-600">{submission.patientNric}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {submission.examType.includes('Migrant') && 'MDW Six-monthly (MOM)'}
                          {submission.examType.includes('Work Permit') && 'Work Permit (MOM)'}
                          {submission.examType.includes('Aged Drivers') && 'Aged Drivers (SPF)'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            submission.status === 'submitted' ? 'default' :
                            submission.status === 'pending_approval' ? 'secondary' :
                            'outline'
                          }
                        >
                          {submission.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{submission.createdByName}</TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(submission.submittedDate || submission.createdDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link to={`/submission/${submission.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
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

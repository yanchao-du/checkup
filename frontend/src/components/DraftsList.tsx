import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { submissionsApi } from '../services';
import type { MedicalSubmission } from '../services';
import { formatExamType } from '../lib/formatters';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Edit, FileEdit, Search, Trash2, ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';

export function DraftsList() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<MedicalSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExamType, setFilterExamType] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [includeDeleted] = useState(false);
  const [sortField, setSortField] = useState<keyof MedicalSubmission | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        setIsLoading(true);
        const response = await submissionsApi.getDrafts({ 
          page: 1, 
          limit: 100,
          includeDeleted: user?.role === 'admin' ? includeDeleted : false
        });
        setDrafts(response.data);
      } catch (error) {
        console.error('Failed to fetch drafts:', error);
        toast.error('Failed to load drafts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrafts();
  }, [user?.role, includeDeleted]);

  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = 
      draft.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.patientNric.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesExamType = filterExamType === 'all' || draft.examType === filterExamType;
    
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

  const sortedDrafts = [...filteredDrafts].sort((a, b) => {
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

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await submissionsApi.delete(deleteId);
        setDrafts(drafts.filter(d => d.id !== deleteId));
        toast.success('Draft deleted successfully');
        setDeleteId(null);
      } catch (error) {
        console.error('Failed to delete draft:', error);
        toast.error('Failed to delete draft');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading drafts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-1 text-2xl font-semibold">Draft Submissions</h2>
        <p className="text-slate-600">Resume editing your saved medical exam drafts</p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {/* <Label className="text-base font-semibold">Search Drafts</Label> */}
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
                  <SelectItem value="DRIVING_LICENCE_TP">
                    Driving Licence (TP)
                  </SelectItem>
                  <SelectItem value="DRIVING_VOCATIONAL_TP_LTA">
                    Driving Vocational (TP/LTA)
                  </SelectItem>
                  <SelectItem value="VOCATIONAL_LICENCE_LTA">
                    Vocational Licence (LTA)
                  </SelectItem>
                  <SelectItem value="PR_MEDICAL">
                    PR Medical (ICA)
                  </SelectItem>
                  <SelectItem value="STUDENT_PASS_MEDICAL">
                    Student Pass (ICA)
                  </SelectItem>
                  <SelectItem value="LTVP_MEDICAL">
                    LTVP (ICA)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="my-4">
            <Label className="text-base font-semibold">Your Drafts ({sortedDrafts.length})</Label>
          </div>
          {sortedDrafts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileEdit className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No drafts found</p>
              {searchQuery && <p className="text-sm mt-1">Try adjusting your search</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                        onClick={() => handleSort('createdByName')}
                        className="h-8 px-2 hover:bg-slate-100 font-semibold"
                      >
                        Created By
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('createdDate')}
                        className="h-8 px-2 hover:bg-slate-100 font-semibold"
                      >
                        Last Modified
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDrafts.map((draft) => {
                    const isDeleted = !!draft.deletedAt;
                    return (
                      <TableRow 
                        key={draft.id} 
                        className={isDeleted ? 'bg-red-50 opacity-60' : ''}
                      >
                        <TableCell>
                          {draft.patientName}
                          {isDeleted && (
                            <span className="ml-2 text-xs text-red-600 font-medium">(Deleted)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-600">{draft.patientNric}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatExamType(draft.examType)}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {draft.createdByName || draft.createdBy}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {isDeleted && draft.deletedAt
                            ? `Deleted: ${new Date(draft.deletedAt).toLocaleDateString()}`
                            : new Date(draft.createdDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {!isDeleted ? (
                            <div className="flex items-center gap-2">
                              <Link to={`/draft/${draft.id}`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="w-4 h-4 mr-1.5" />
                                  Continue
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteId(draft.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1.5" />
                                Delete
                              </Button>
                            </div>
                          ) : user?.role === 'admin' ? (
                            <Link to={`/view-submission/${draft.id}`}>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                              >
                                <Edit className="w-4 h-4 mr-1.5" />
                                View
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-sm text-slate-500 italic">No actions available</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this draft. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

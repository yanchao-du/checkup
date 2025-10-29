import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { submissionsApi } from '../services';
import type { MedicalSubmission } from '../services';
import { formatExamType } from '../lib/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Edit, FileEdit, Search, Trash2 } from 'lucide-react';
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [includeDeleted, setIncludeDeleted] = useState(false);

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

  const filteredDrafts = drafts.filter(draft => 
    draft.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.patientNric.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <CardHeader>
          <CardTitle>Search Drafts</CardTitle>
          <CardDescription>Find your saved drafts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by patient name or NRIC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* {user?.role === 'admin' && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  id="includeDeleted"
                  checked={includeDeleted}
                  onChange={(e) => setIncludeDeleted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label 
                  htmlFor="includeDeleted" 
                  className="text-sm font-medium text-slate-700 cursor-pointer select-none"
                >
                  Show deleted drafts
                </label>
              </div>
            )} */}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Drafts ({filteredDrafts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDrafts.length === 0 ? (
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
                    <TableHead>Patient Name</TableHead>
                    <TableHead>NRIC/FIN</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrafts.map((draft) => {
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

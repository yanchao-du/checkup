import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Star, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { usersApi } from '../services';
import { useAuth } from './AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

type ExamType = 
  | 'SIX_MONTHLY_MDW'
  | 'FULL_MEDICAL_EXAM'
  | 'SIX_MONTHLY_FMW'
  | 'DRIVING_VOCATIONAL_TP_LTA'
  | 'PR_MEDICAL'
  | 'LTVP_MEDICAL'
  | 'STUDENT_PASS_MEDICAL';

const EXAM_TYPES: { value: ExamType; label: string; category: string }[] = [
  { value: 'SIX_MONTHLY_MDW', label: 'Six-monthly Medical Exam (6ME) for Migrant Domestic Worker', category: 'Ministry of Manpower (MOM)' },
  { value: 'FULL_MEDICAL_EXAM', label: 'Full Medical Examination for Foreign Worker', category: 'Ministry of Manpower (MOM)' },
  { value: 'SIX_MONTHLY_FMW', label: 'Six-monthly Medical Exam (6ME) for Female Migrant Worker', category: 'Ministry of Manpower (MOM)' },
  { value: 'DRIVING_VOCATIONAL_TP_LTA', label: 'Driving Licence / Vocational Licence', category: 'Traffic Police (TP) / Land Transport Authority (LTA)' },
  { value: 'PR_MEDICAL', label: 'Medical Examination for Permanent Residency', category: 'Immigration & Checkpoints Authority (ICA)' },
  { value: 'LTVP_MEDICAL', label: 'Medical Examination for Long Term Visit Pass', category: 'Immigration & Checkpoints Authority (ICA)' },
  { value: 'STUDENT_PASS_MEDICAL', label: 'Medical Examination for Student Pass', category: 'Immigration & Checkpoints Authority (ICA)' },
];

export function FavoritesManager() {
  const { user, setUser } = useAuth();
  const [favoriteExamTypes, setFavoriteExamTypes] = useState<string[]>(user?.favoriteExamTypes || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddFavorite = async (examType: ExamType) => {
    if (!user?.id) {
      toast.error('Not authenticated', {
        description: 'Please log in to manage favorites',
      });
      return;
    }

    if (favoriteExamTypes.length >= 3) {
      toast.error('Maximum 3 favorites allowed', {
        description: 'Remove a favorite before adding a new one',
      });
      return;
    }

    if (favoriteExamTypes.includes(examType)) {
      toast.info('Already in favorites');
      return;
    }

    const newFavorites = [...favoriteExamTypes, examType];
    setIsUpdating(true);

    try {
      await usersApi.updateFavoriteExamTypes(newFavorites);
      setFavoriteExamTypes(newFavorites);
      
      // Update user context
      setUser({ ...user, favoriteExamTypes: newFavorites });
      
      toast.success('Added to favorites');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to add favorite:', error);
      toast.error('Failed to add favorite', {
        description: 'Please try again',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveFavorite = async (examType: string) => {
    if (!user?.id) {
      toast.error('Not authenticated', {
        description: 'Please log in to manage favorites',
      });
      return;
    }

    const newFavorites = favoriteExamTypes.filter(t => t !== examType);
    setIsUpdating(true);

    try {
      await usersApi.updateFavoriteExamTypes(newFavorites);
      setFavoriteExamTypes(newFavorites);
      
      // Update user context
      setUser({ ...user, favoriteExamTypes: newFavorites });
      
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast.error('Failed to remove favorite', {
        description: 'Please try again',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const availableExamTypes = EXAM_TYPES.filter(
    examType => !favoriteExamTypes.includes(examType.value)
  );

  // Group available exam types by category
  const groupedExamTypes = availableExamTypes.reduce((acc, examType) => {
    if (!acc[examType.category]) {
      acc[examType.category] = [];
    }
    acc[examType.category].push(examType);
    return acc;
  }, {} as Record<string, typeof EXAM_TYPES>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <CardTitle>Favorite Exam Types</CardTitle>
          </div>
          {favoriteExamTypes.length < 3 && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Favorite
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Favorite Exam Type</DialogTitle>
                  <DialogDescription>
                    Select an exam type to add to your favorites (maximum 3)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {Object.entries(groupedExamTypes).map(([category, types]) => (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-slate-700 mb-2">{category}</h3>
                      <div className="space-y-2">
                        {types.map((examType) => (
                          <button
                            key={examType.value}
                            onClick={() => handleAddFavorite(examType.value)}
                            disabled={isUpdating}
                            className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-sm text-slate-900">{examType.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <CardDescription>
          Manage your frequently used exam types (max 3)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {favoriteExamTypes.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Star className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No favorites yet</p>
            <p className="text-xs mt-1">Add up to 3 exam types for quick access</p>
          </div>
        ) : (
          <div className="space-y-2">
            {favoriteExamTypes.map((examType) => {
              const examTypeInfo = EXAM_TYPES.find(t => t.value === examType);
              return (
                <div
                  key={examType}
                  className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    <span className="text-sm text-slate-900">
                      {examTypeInfo?.label || examType}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFavorite(examType)}
                    disabled={isUpdating}
                    className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

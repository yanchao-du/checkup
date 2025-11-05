import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, Loader2 } from 'lucide-react';

export default function Help() {
  const { user } = useAuth();
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Determine which guide to load based on user role
        const guideName = user?.role === 'doctor' ? 'DOCTOR_USER_GUIDE.md' : 'NURSE_USER_GUIDE.md';
        const response = await fetch(`/guides/${guideName}`);
        
        if (!response.ok) {
          throw new Error('Failed to load user guide');
        }
        
        const text = await response.text();
        setMarkdown(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkdown();
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading user guide...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">!</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Guide</h3>
              <p className="text-slate-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {user?.role === 'doctor' ? 'Doctor User Guide' : 'Nurse User Guide'}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Complete guide to using the Medical Examination Portal
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:pb-3 prose-h1:border-b prose-h1:border-slate-200 prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-blue-900 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-slate-800 prose-h4:text-lg prose-h4:font-medium prose-h4:mt-4 prose-h4:mb-2 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-strong:font-semibold prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-ul:list-disc prose-ol:list-decimal prose-li:text-slate-700 prose-table:border-collapse prose-th:border prose-th:border-slate-300 prose-th:bg-slate-100 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-td:border prose-td:border-slate-300 prose-td:px-4 prose-td:py-2 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-hr:border-slate-200">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom rendering for checkboxes in task lists
                input: ({ node, ...props }) => {
                  if (props.type === 'checkbox') {
                    return <input {...props} className="mr-2" />;
                  }
                  return <input {...props} />;
                },
                // Add proper table styling
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-6">
                    <table {...props} className="min-w-full divide-y divide-slate-300" />
                  </div>
                ),
                // Style code blocks
                code: ({ className, children, ...props }: any) => {
                  const isInline = !className?.includes('language-');
                  return !isInline ? (
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-4">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Back to top button */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors"
          aria-label="Back to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

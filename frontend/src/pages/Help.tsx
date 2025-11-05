import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
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
          <article className="prose prose-slate prose-lg max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h1:text-4xl prose-h1:mb-4 prose-h1:mt-8
            prose-h2:text-3xl prose-h2:mb-3 prose-h2:mt-6 prose-h2:border-b prose-h2:pb-2
            prose-h3:text-2xl prose-h3:mb-2 prose-h3:mt-5
            prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-4
            prose-p:text-base prose-p:leading-7 prose-p:mb-4
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:font-semibold prose-strong:text-slate-900
            prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
            prose-li:my-1 prose-li:text-base
            prose-code:text-sm prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-['']
            prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic
            prose-table:w-full prose-table:border-collapse
            prose-thead:bg-slate-100
            prose-th:border prose-th:border-slate-300 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
            prose-td:border prose-td:border-slate-300 prose-td:px-4 prose-td:py-2
            prose-tr:even:bg-slate-50
            prose-img:rounded-lg prose-img:shadow-md"
          >
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: 'wrap' }]
              ]}
            >
              {markdown}
            </ReactMarkdown>
          </article>
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

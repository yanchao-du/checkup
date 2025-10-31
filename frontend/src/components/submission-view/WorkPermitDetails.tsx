interface WorkPermitDetailsProps {
  formData: Record<string, any>;
}

export function WorkPermitDetails({ formData }: WorkPermitDetailsProps) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-900 mb-3">Test Results</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500 mb-1">HIV Test</p>
          <p className="text-slate-900">{formData.hivTest || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 mb-1">TB Test</p>
          <p className="text-slate-900">{formData.tbTest || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
}

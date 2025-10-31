interface AgedDriversDetailsProps {
  formData: Record<string, any>;
}

export function AgedDriversDetails({ formData }: AgedDriversDetailsProps) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-900 mb-3">Medical Assessment</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500 mb-1">Visual Acuity</p>
          <p className="text-slate-900">{formData.visualAcuity || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 mb-1">Hearing Test</p>
          <p className="text-slate-900">{formData.hearingTest || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 mb-1">Diabetes</p>
          <p className="text-slate-900">{formData.diabetes || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
}

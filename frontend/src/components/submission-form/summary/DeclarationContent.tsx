export function MomDeclarationContent() {
  return (
    <>
      <p className="text-sm text-slate-700 leading-relaxed">
        Please read and acknowledge the following:
      </p>
      <ul className="list-disc pl-5 mt-2">
        <li className="text-sm text-slate-700 leading-relaxed">
          I am authorised by the clinic to submit the results and make the declarations in this form on its behalf.
        </li>
        <li className="text-sm text-slate-700 leading-relaxed">
          By submitting this form, I understand that the information given will be submitted to the Controller or an authorised officer who may act on the information given by me. I further declare that the information provided by me is true to the best of my knowledge and belief.
        </li>
      </ul>
    </>
  );
}

export function IcaDeclarationContent() {
  return (
    <>
      <p className="text-sm text-slate-700 leading-relaxed">
        {/* TODO: Replace with actual ICA declaration text when provided */}
        <strong>Note:</strong> ICA-specific declaration text to be provided. This is a placeholder.
      </p>
      <p className="text-sm text-slate-500 italic mt-2">
        The actual declaration text for ICA medical examinations will be updated here.
      </p>
    </>
  );
}

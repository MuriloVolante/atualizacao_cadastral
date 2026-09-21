'use client';

import { useFormStatus } from 'react-dom';
import Spinner from './Spinner';

export default function SubmitButton({
  children,
  pendingLabel,
  className = 'btn-primary',
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending}>
      {pending && <Spinner />}
      {pending ? pendingLabel ?? children : children}
    </button>
  );
}

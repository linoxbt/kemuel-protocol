import { LoanCard } from './LoanCard';
import type { Loan } from '@/lib/types';

export function LoanList({ loans }: { loans: Loan[] }) {
  if (loans.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {loans.map((loan) => (
        <LoanCard key={loan.id} loan={loan} />
      ))}
    </div>
  );
}

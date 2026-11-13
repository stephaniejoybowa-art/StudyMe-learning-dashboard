import { ArrowLeft, CircleHelp } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center" data-testid="page-not-found">
      <CircleHelp size={36} className="mb-4 text-[#8b70ae]" />
      <h1 className="font-display text-3xl font-extrabold text-[#302a47]">That page isn’t here.</h1>
      <p className="mt-2 text-sm text-[#777286]">Head back to your learning dashboard and choose a subject to continue.</p>
      <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8060ae] px-4 py-3 text-sm font-bold text-white hover:bg-[#6f509b]" data-testid="link-return-to-dashboard">
        <ArrowLeft size={16} /> Back to learning
      </Link>
    </div>
  );
}

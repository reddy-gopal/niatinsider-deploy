import Link from 'next/link';

export default function WriteIndexPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-[#1e293b]">Write</h1>
      <p className="mt-2 text-sm text-[#64748b]">
        Use{' '}
        <Link href="/contribute/write" className="text-[#991b1b] font-medium hover:underline">
          Contribute → Write
        </Link>{' '}
        to create an article.
      </p>
    </div>
  );
}

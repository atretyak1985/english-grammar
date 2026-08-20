import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[640px] px-5 py-20 text-center">
      <div className="text-ink-3 text-[13px] font-extrabold tracking-[1.5px] uppercase">404</div>
      <h1 className="mt-2 mb-3 text-[28px] font-bold tracking-[-0.6px]">Сторінки немає</h1>
      <p className="text-ink-2 mb-6 text-[16px]">
        Можливо, тема ще не написана — перевірте список тем на головній.
      </p>
      <Link
        href="/"
        className="bg-ps inline-block rounded-lg px-4 py-2 text-[14px] font-bold text-white"
      >
        На головну
      </Link>
    </div>
  );
}

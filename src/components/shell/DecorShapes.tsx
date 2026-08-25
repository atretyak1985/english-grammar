/**
 * Плями й зірки за контентом. Шар прибитий до вікна, а не до сторінки, —
 * тому при скролі він лишається на місці й читається як тло оболонки, а не
 * як частина екрана. Насиченість веде --shape-op: у темній темі те саме
 * розкладання ледь помітне, інакше плями перебивали б текст.
 */
export function DecorShapes() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ opacity: 'var(--shape-op)' }}
    >
      <div
        className="bg-green-bg absolute top-[8%] left-[26%] h-[70px] w-[70px] rounded-[24px]"
        style={{ transform: 'rotate(14deg)', animation: 'gl-float 13s ease-in-out infinite' }}
      />
      <div
        className="bg-pc-bg absolute top-[60%] left-[34%] h-[44px] w-[44px] rounded-full"
        style={{ animation: 'gl-float2 11s ease-in-out infinite' }}
      />
      <div
        className="bg-pp-bg absolute top-[24%] right-[6%] h-[90px] w-[90px] rounded-full"
        style={{ animation: 'gl-drift 17s ease-in-out infinite' }}
      />
      <div
        className="bg-ps-bg absolute right-[22%] bottom-[12%] h-[52px] w-[52px] rounded-[18px]"
        style={{ transform: 'rotate(-10deg)', animation: 'gl-float 15s ease-in-out infinite' }}
      />
      <Star className="top-[14%] left-[52%]" size={34} fill="var(--yellow)" duration="6s" />
      <Star className="bottom-[20%] left-[12%]" size={24} fill="var(--coral-bg)" duration="8s" />
      <Star className="top-[74%] right-[8%]" size={28} fill="var(--ps-bg)" duration="7s" />
    </div>
  );
}

function Star({
  className,
  size,
  fill,
  duration,
}: {
  className: string;
  size: number;
  fill: string;
  duration: string;
}) {
  return (
    <svg
      className={`absolute ${className}`}
      style={{ animation: `gl-wiggle ${duration} ease-in-out infinite` }}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
    >
      <path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4z" />
    </svg>
  );
}

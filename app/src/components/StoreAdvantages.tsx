import Image from "next/image";

interface Advantage {
  title: string;
  text: string;
  /** Icon asset in /public/logo. */
  icon: string;
}

const advantages: Advantage[] = [
  {
    title: "CONTACT US",
    text: "Our client advisors are available to answer all of your enquiries.",
    icon: "/logo/Frame 4.png",
  },
  {
    title: "SECURE DELIVERY AND FREE RETURNS",
    text: "Complimentary insured delivery and free returns within 30 days.",
    icon: "/logo/Frame 3.png",
  },
  {
    title: "AN EXCEPTIONAL SETTING",
    text: "Discover our creations within the refined setting of our boutiques.",
    icon: "/logo/Frame 5.png",
  },
  {
    title: "PAYMENT IN INSTALLMENTS",
    text: "Spread the cost of your order over 3 or 4 interest-free instalments.",
    icon: "/logo/Frame 6.png",
  },
];

export default function StoreAdvantages() {
  return (
    <section className="border-t border-neutral-200 bg-white px-6 py-16 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="text-center font-sans text-sm font-medium uppercase tracking-[0.35em] text-neutral-800">
          Online Store Advantages
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 md:gap-12">
          {advantages.map((a) => (
            <div
              key={a.title}
              className="flex flex-col items-center text-center"
            >
              <Image
                src={a.icon}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                aria-hidden
              />
              <h3 className="mt-5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-900">
                {a.title}
              </h3>
              <p className="mt-3 max-w-[220px] font-sans text-[11px] leading-relaxed tracking-[0.04em] text-neutral-500">
                {a.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

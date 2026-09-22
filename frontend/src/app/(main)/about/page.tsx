import Link from "next/link";
import { ArrowRight, Heart, MapPin, Star, Users, Sparkles, Diamond, ShieldCheck } from "lucide-react";

const metrics = [
  { label: "Happy Members", value: "50K+" },
  { label: "Events Hosted", value: "100+" },
  { label: "User Satisfaction", value: "4.8 ★" },
  { label: "Meaningful Connections", value: "10K+" },
];

const team = [
  {
    name: "Debasmita",
    role: "Co-founder",
    title: "Chief Strategies & Creative Director",
    description: "Building experiences that bring people closer.",
    accent: "from-[#f6d8d6] to-[#f8ecec]",
  },
  {
    name: "Rahul Sharma",
    role: "Founder & CEO",
    title: "Turning ideas into meaningful connections.",
    description: "Building experiences that bring people closer.",
    accent: "from-[#e7d5df] to-[#f9f1f1]",
  },
  {
    name: "Shivendra Kumar",
    role: "CTO",
    title: "Building a safer, smarter and smoother platform for everyone.",
    description: "Building experiences that bring people closer.",
    accent: "from-[#e8d3d2] to-[#f9eeef]",
  },
  {
    name: "Priya Singh",
    role: "Community Manager",
    title: "Listening, supporting, and growing our community.",
    description: "Building experiences that bring people closer.",
    accent: "from-[#f1d9dc] to-[#f8f1f1]",
  },
];

const values = [
  { title: "Trust", text: "Your safety and privacy matter to us." },
  { title: "Inclusivity", text: "Everyone is welcome, always." },
  { title: "Respect", text: "Real people. Real stories." },
  { title: "Community", text: "Together, we build a kinder, more connected world." },
];

const collageImages = [
  { className: "rounded-[20px] border border-[#efdfe2] bg-[linear-gradient(135deg,#53202f,#7d2f47)] p-3 shadow-lg" },
  { className: "rounded-[20px] border border-[#efdfe2] bg-[linear-gradient(135deg,#8d6771,#d8a3ab)] p-3 shadow-lg" },
  { className: "rounded-[20px] border border-[#efdfe2] bg-[linear-gradient(135deg,#d4a2ab,#f6d9d5)] p-3 shadow-lg" },
  { className: "rounded-[20px] border border-[#efdfe2] bg-[linear-gradient(135deg,#450f1d,#a84a62)] p-3 shadow-lg" },
];

export default function AboutPage() {
  return (
    <main className="bg-[#f6efe9] px-3 py-4 sm:px-5 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-5 xl:grid-cols-[1.5fr_1.1fr]">
          <section className="rounded-[24px] border border-[#e8d7da] bg-[#f9f1ee] p-4 sm:p-5 lg:p-6">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-[#7a1f39]">
              About Us
            </div>

            <h1 className="max-w-[540px] text-[34px] font-bold leading-[0.9] tracking-[-0.06em] text-[#4d0d1d] sm:text-[42px] lg:text-[60px]">
              More Than
              <br />
              A Platform.
              <br />
              A Movement.
            </h1>

            <p className="mt-4 max-w-[640px] text-[14px] leading-relaxed text-[#5f3139] sm:text-[16px]">
              Modhuralap is a Kolkata-based platform built to help people find real companionship,
              meaningful conversations, and shared experiences — both online and offline. We believe in a
              kinder, more connected world where people can meet, explore, and create genuine relationships,
              friendships and opportunities, on their own terms.
            </p>

            <div className="mt-6 flex justify-start">
              <Link
                href="/story"
                className="inline-flex items-center gap-2 rounded-full bg-[#7a1f39] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(122,31,57,0.2)] transition-colors hover:bg-[#661a2d]"
              >
                Our Story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="flex flex-col gap-1 border-r border-[#e5c9ce] pr-3 last:border-r-0">
                  <div className="text-[24px] font-bold tracking-[-0.05em] text-[#7a1f39] sm:text-[30px]">
                    {metric.value}
                  </div>
                  <div className="text-[11px] leading-tight text-[#5f3139] sm:text-[12px]">{metric.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[26px] border border-[#ead7db] bg-[#f9f1ee] p-3 sm:p-4">
            <div className="absolute left-[-18px] top-[-18px] hidden h-28 w-28 rounded-full bg-[#f0dfe4]/80 blur-xl lg:block" aria-hidden="true" />
            <div className="absolute right-[-24px] bottom-[-18px] hidden h-36 w-36 rounded-full bg-[#f0dfe4]/80 blur-xl lg:block" aria-hidden="true" />

            <div className="relative grid gap-3 sm:grid-cols-2">
              {collageImages.map((item, index) => (
                <div
                  key={index}
                  className={`${item.className} ${
                    index === 0 ? "sm:translate-y-4" : index === 1 ? "sm:translate-y-0" : index === 2 ? "sm:-translate-y-2" : "sm:-translate-y-6"
                  }`}
                >
                  <div className="relative h-[150px] overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,#f3d5d6_0%,#d58c9d_100%)] sm:h-[170px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.35),transparent_30%),linear-gradient(135deg,rgba(90,20,43,0.25),transparent_55%)]" />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#4d0d1d]/40 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center text-center text-[18px] font-medium italic text-[#fff8f8]">
                      <span className="max-w-[160px] leading-none">
                        {index === 0 && "Real People\nReal Stories"}
                        {index === 1 && "Different\nPeople\nSame Beautiful\nKolkata"}
                        {index === 2 && "Connections\nBeyond\nScreens"}
                        {index === 3 && "A Kinder\nWorld\nTogether"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_0.95fr]">
          <section className="rounded-[24px] border border-[#e8d7da] bg-[#f9f1ee] p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full border-[2px] border-[#7a1f39] bg-[#f0dfe4] text-[#7a1f39]">
                  <Users className="h-5 w-5" />
                </div>
                <h2 className="text-[28px] font-bold tracking-[-0.05em] text-[#4d0d1d] sm:text-[36px]">Our Team</h2>
              </div>
              <div className="text-[14px] text-[#5f3139]">
                A passionate team working to bring people closer.
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {team.map((member) => (
                <div key={member.name} className="rounded-[18px] border border-[#e7d0d5] bg-[#f8efee] p-3 shadow-[0_8px_18px_rgba(122,31,57,0.02)]">
                  <div className="flex justify-center">
                    <div className={`flex h-[84px] w-[84px] items-center justify-center rounded-full bg-gradient-to-br ${member.accent} text-[24px] font-bold text-[#4d0d1d] ring-4 ring-white`}>
                      {member.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="text-[20px] font-bold tracking-[-0.04em] text-[#4d0d1d]">{member.name}</div>
                    <div className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a1f39]">{member.role}</div>
                    <div className="mt-2 text-[12px] leading-relaxed text-[#5f3139]">{member.title}</div>
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-3 text-[#7a1f39]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f2dfe4] text-[10px] font-bold">
                      in
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f2dfe4] text-[10px] font-bold">
                      x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[22px] border border-[#e8d7da] bg-[#f9f1ee] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full border-[2px] border-[#7a1f39] bg-[#f0dfe4] text-[#7a1f39]">
                  <Heart className="h-4 w-4" fill="currentColor" />
                </div>
                <h3 className="text-[22px] font-bold tracking-[-0.04em] text-[#4d0d1d] sm:text-[30px]">Our Mission</h3>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-[#5f3139] sm:text-[15px]">
                To create a safe, inclusive and trusted platform where people can connect, share experiences,
                and build meaningful relationships — online and offline.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#e8d7da] bg-[#f9f1ee] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full border-[2px] border-[#7a1f39] bg-[#f0dfe4] text-[#7a1f39]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-[22px] font-bold tracking-[-0.04em] text-[#4d0d1d] sm:text-[30px]">Our Vision</h3>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-[#5f3139] sm:text-[15px]">
                To become the most loved platform for genuine companionship, real friendships and shared
                experiences in India and beyond.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#e8d7da] bg-[#f9f1ee] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full border-[2px] border-[#7a1f39] bg-[#f0dfe4] text-[#7a1f39]">
                  <Diamond className="h-4 w-4" />
                </div>
                <h3 className="text-[22px] font-bold tracking-[-0.04em] text-[#4d0d1d] sm:text-[30px]">Our Values</h3>
              </div>
              <div className="mt-4 space-y-4">
                {values.map((value) => (
                  <div key={value.title} className="border-b border-[#ead7dc] pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f2dfe4] text-[#7a1f39]">
                        {value.title === "Trust" ? <ShieldCheck className="h-3.5 w-3.5" /> : value.title === "Inclusivity" ? <Users className="h-3.5 w-3.5" /> : value.title === "Respect" ? <Heart className="h-3.5 w-3.5" fill="currentColor" /> : <Star className="h-3.5 w-3.5" />}
                      </div>
                      <div className="text-[14px] font-bold text-[#4d0d1d] sm:text-[18px]">{value.title}</div>
                    </div>
                    <div className="mt-1 pl-9 text-[12px] leading-relaxed text-[#5f3139] sm:text-[14px]">{value.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 rounded-[22px] bg-[#5d1129] px-4 py-4 text-white shadow-[0_10px_22px_rgba(122,31,57,0.18)] sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#f1dfe4] text-[#5d1129]">
                    <Heart className="h-4 w-4" fill="currentColor" />
                  </div>
                  <div className="text-[13px] leading-tight text-[#f7e7ea] sm:text-[15px]">
                    Join Our Community
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-[#f7e7ea]" />
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-5 rounded-[22px] border border-[#e8d7da] bg-[#f9f1ee] p-4 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-[18px] font-bold tracking-[-0.04em] text-[#4d0d1d] sm:text-[22px]">
              Kolkata
              <span className="italic font-medium text-[#7a1f39]"> Lives in Connections</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#f1dfe4] px-3 py-2 text-[12px] font-medium text-[#5d1129]">
              <MapPin className="h-4 w-4" />
              Kolkata, India
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

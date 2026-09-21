"use client";

import { useMemo, useState } from "react";
import {
  Heart,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  Star,
} from "lucide-react";

const chips = [
  "All",
  "Coffee",
  "Travel",
  "Food & Dining",
  "Music",
  "Sports",
  "Art & Culture",
  "More",
] as const;

const sortOptions = ["Recommended", "Newest", "Top Rated", "Nearby"] as const;
const genders = ["Female", "Male", "Non-binary", "Any"] as const;
const locationOptions = ["Kolkata", "Mumbai", "Delhi", "Bangalore"] as const;
const languageOptions = ["English", "Hindi", "Bengali", "Tamil"] as const;
const interestOptions = [
  "Coffee & Cafés",
  "Travel & Exploration",
  "Food & Dining",
  "Photography",
  "Sports",
  "Music",
  "Art & Culture",
  "Gaming",
  "More",
] as const;

const buddies = [
  {
    name: "Anya Sharma",
    rating: 4.9,
    reviews: 24,
    age: 28,
    city: "Kolkata",
    languages: ["English", "Hindi", "Bengali"],
    interests: ["Coffee", "Photography", "Food Walks"],
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    gender: "Female",
    price: 1200,
  },
  {
    name: "Rohan Das",
    rating: 4.8,
    reviews: 27,
    age: 27,
    city: "Kolkata",
    languages: ["English", "Hindi"],
    interests: ["Travel", "Photography", "Adventure"],
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    gender: "Male",
    price: 1500,
  },
  {
    name: "Isha Verma",
    rating: 4.9,
    reviews: 26,
    age: 26,
    city: "Kolkata",
    languages: ["English", "Hindi"],
    interests: ["Food Walk", "Shopping", "Art & Culture"],
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    gender: "Female",
    price: 1400,
  },
  {
    name: "Arit Sen",
    rating: 4.8,
    reviews: 30,
    age: 30,
    city: "Kolkata",
    languages: ["English", "Hindi", "Bengali"],
    interests: ["Travel", "Music", "Sports"],
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    gender: "Male",
    price: 1800,
  },
  {
    name: "Tiya Ghosh",
    rating: 4.9,
    reviews: 39,
    age: 25,
    city: "Kolkata",
    languages: ["English", "Bengali"],
    interests: ["Beach Trips", "Photography", "Travel"],
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    gender: "Female",
    price: 900,
  },
  {
    name: "Souvik Roy",
    rating: 4.8,
    reviews: 29,
    age: 29,
    city: "Kolkata",
    languages: ["English", "Hindi"],
    interests: ["Food", "Gaming", "Movies"],
    image:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=800&q=80",
    gender: "Male",
    price: 1100,
  },
  {
    name: "Mital Paul",
    rating: 4.9,
    reviews: 23,
    age: 31,
    city: "Kolkata",
    languages: ["English", "Hindi", "Bengali"],
    interests: ["Heritage Walk", "Cafe Hopping", "Culture"],
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    gender: "Female",
    price: 1250,
  },
  {
    name: "Debanjan Mitra",
    rating: 4.7,
    reviews: 28,
    age: 28,
    city: "Kolkata",
    languages: ["English", "Hindi", "Bengali"],
    interests: ["Photography", "Travel", "Train Rides"],
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    gender: "Male",
    price: 1700,
  },
] as const;

function BuddyCard({ buddy }: { buddy: (typeof buddies)[number] }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#f0dfe3] bg-white shadow-[0_8px_22px_rgba(122,31,57,0.08)]">
      <div className="relative h-52 w-full overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${buddy.image})` }}
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[10px] font-semibold text-[#7a1f39] backdrop-blur-sm">
            <ShieldCheck className="size-3.5" />
            Verified
          </div>
          <button className="flex size-8 items-center justify-center rounded-full bg-white/80 text-[#7a1f39] backdrop-blur-sm" type="button" aria-label={`Save ${buddy.name}`}>
            <Heart className="size-4" fill="none" />
          </button>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[17px] font-bold text-[#2d111b]">{buddy.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-[#6a4953]">
              <span className="flex items-center gap-1 font-semibold">
                <Star className="size-3.5 fill-[#ffb84d] text-[#ffb84d]" />
                {buddy.rating}
              </span>
              <span>({buddy.reviews})</span>
            </div>
          </div>
          <span className="rounded-full border border-[#e7d5d8] bg-[#fff6f6] px-2 py-1 text-[10px] font-medium text-[#7a1f39]">
            {buddy.city}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6d4a51]">
          <MapPin className="size-3.5 text-[#7a1f39]" />
          <span>{buddy.city}</span>
          <span>•</span>
          <span>{buddy.languages.join(", ")}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {buddy.interests.map((item) => (
            <span key={item} className="rounded-full bg-[#f5e8eb] px-2 py-1 text-[10px] font-medium text-[#5a2435]">
              {item}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7a1f39] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#661b2f]"
        >
          View Profile
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

export default function ExploreBuddiesPage() {
  const [selectedChip, setSelectedChip] = useState<(typeof chips)[number]>("All");
  const [selectedSort, setSelectedSort] = useState<(typeof sortOptions)[number]>("Recommended");
  const [selectedGender, setSelectedGender] = useState<(typeof genders)[number]>("Any");
  const [selectedLocation, setSelectedLocation] = useState<(typeof locationOptions)[number]>("Kolkata");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(2500);

  const priceMin = 300;
  const priceMax = 2500;
  const selectedPriceLabel = `₹${priceMin} - ₹${maxPrice}`;

  const filteredBuddies = useMemo(() => {
    return buddies.filter((buddy) => {
      const matchesChip =
        selectedChip === "All" ||
        buddy.interests.some((interest) =>
          interest.toLowerCase().includes(selectedChip.toLowerCase()) ||
          selectedChip === "More"
        );

      const matchesGender =
        selectedGender === "Any" || buddy.gender === selectedGender;

      const matchesLocation =
        selectedLocation === "Kolkata" || (buddy.city as string) === selectedLocation;

      const matchesLanguages =
        selectedLanguages.length === 0 ||
        selectedLanguages.every((language) => (buddy.languages as readonly string[]).includes(language));

      const matchesInterests =
        selectedInterests.length === 0 ||
        selectedInterests.every((interest) =>
          buddy.interests.some((item) => item.toLowerCase().includes(interest.toLowerCase()))
        );

      const matchesPrice = buddy.price <= maxPrice;

      return (
        matchesChip &&
        matchesGender &&
        matchesLocation &&
        matchesLanguages &&
        matchesInterests &&
        matchesPrice
      );
    });
  }, [maxPrice, selectedChip, selectedGender, selectedInterests, selectedLanguages, selectedLocation]);

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((current) =>
      current.includes(language)
        ? current.filter((value) => value !== language)
        : [...current, language]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((value) => value !== interest)
        : [...current, interest]
    );
  };

  return (
    <main className="p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1500px] rounded-[28px] border border-[#f0e0e4] bg-[#f7efe9] p-2 shadow-[0_16px_32px_rgba(77,13,29,0.06)]">
        <section className="overflow-hidden rounded-[24px] border border-[#efdfdf] bg-[#f7eff0]">
          <div
            className="relative overflow-hidden rounded-[24px] border border-[#f3dfdf] bg-gradient-to-r from-[#f2e8e5] via-[#f3d9e0] to-[#f1e9ea] p-4 sm:p-5"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.08)), linear-gradient(120deg, #f4f0ef 0%, #f3d9df 35%, #f2dfdc 100%)",
            }}
          >
            <div className="absolute inset-y-0 right-0 hidden w-[35%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,.42),transparent_38%)] lg:block" />

            <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-[760px]">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#7a1f39]">
                  Explore Buddies
                </div>
                <h1 className="font-serif text-[42px] leading-[0.98] text-[#4b0d1d] sm:text-[50px] xl:text-[62px]">
                  Find Your Ideal <span className="italic text-[#7a1f39]">Buddy</span>
                </h1>
                <p className="mt-3 max-w-[680px] text-[15px] font-medium text-[#5d2a38] sm:text-[17px]">
                  Skip the awkward small talk. Hire a friend who vibe with your exact hobbies.
                </p>
              </div>

              <div className="hidden w-[210px] shrink-0 xl:block">
                <div className="relative h-[140px] overflow-hidden rounded-[22px] bg-[#dcb8c0]">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url(https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4d0d1d]/65 via-[#4d0d1d]/15 to-transparent" />
                  <div className="absolute bottom-3 right-3 text-right text-[18px] font-medium italic leading-[1.08] text-[#fff6f7]">
                    Real People.
                    <br />
                    Real Connections.
                    <br />
                    Always.
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-5 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSelectedChip(chip)}
                  className={`rounded-full border px-3 py-2 text-sm font-medium transition-all ${
                    selectedChip === chip
                      ? "border-[#7a1f39] bg-[#7a1f39] text-white shadow-sm"
                      : "border-[#d5c0c6] bg-white/75 text-[#5a1d2d] hover:bg-white"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-[15px] font-semibold text-[#3f1b27]">
            Showing 1-{filteredBuddies.length} of {buddies.length} buddies
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-full border border-[#e9d5d9] bg-white px-3 py-2 text-sm font-medium text-[#5a1d2d] shadow-sm">
              Sort by:
              <select
                value={selectedSort}
                onChange={(event) => setSelectedSort(event.target.value as (typeof sortOptions)[number])}
                className="bg-transparent font-medium text-[#5a1d2d] outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-[#e8d8dc] bg-white px-3 py-2 text-sm font-medium text-[#5a1d2d] shadow-sm"
            >
              <SlidersHorizontal className="size-4" />
              Filter Buddies
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
            {filteredBuddies.map((buddy) => (
              <BuddyCard key={buddy.name} buddy={buddy} />
            ))}
          </div>

          <aside className="rounded-[22px] border border-[#f0dfe3] bg-[#fff9f8] p-4 shadow-[0_10px_20px_rgba(122,31,57,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-[#2d111b]">Filter Buddies</h3>
              <button type="button" className="text-sm font-medium text-[#7a1f39]">
                Reset
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d4c56]">
                  Price Range
                </div>
                <div className="rounded-xl border border-[#e5dbe0] bg-white p-2.5">
                  <div className="mb-3 flex items-center justify-between text-[12px] font-semibold text-[#5a1d2d]">
                    <span>₹{priceMin}</span>
                    <span>{selectedPriceLabel}</span>
                  </div>

                  <div className="relative pt-2">
                    <input
                      type="range"
                      min={priceMin}
                      max={priceMax}
                      step={50}
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(Number(event.target.value))}
                      className="h-2 w-full cursor-pointer accent-[#7a1f39]"
                    />

                    <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-[#7a1f39]">
                      <span>₹{priceMin}</span>
                      <span>₹{priceMax}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d4c56]">
                  Age Range
                </div>
                <div className="rounded-xl border border-[#e5dbe0] bg-white p-2.5">
                  <select className="w-full bg-transparent text-sm text-[#5a1d2d] outline-none">
                    <option>Select Age Range</option>
                    <option>18-25</option>
                    <option>26-30</option>
                    <option>31-35</option>
                    <option>35+</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d4c56]">
                  Gender
                </div>
                <div className="rounded-xl border border-[#e5dbe0] bg-white p-2.5">
                  <div className="space-y-2">
                    {genders.map((gender) => (
                      <label key={gender} className="flex cursor-pointer items-center gap-2 text-sm text-[#5a1d2d]">
                        <input
                          type="radio"
                          name="gender"
                          checked={selectedGender === gender}
                          onChange={() => setSelectedGender(gender)}
                          className="h-4 w-4 accent-[#7a1f39]"
                        />
                        <span>{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d4c56]">
                  Location
                </div>
                <div className="rounded-xl border border-[#e5dbe0] bg-white p-2.5">
                  <select
                    value={selectedLocation}
                    onChange={(event) => setSelectedLocation(event.target.value as (typeof locationOptions)[number])}
                    className="w-full bg-transparent text-sm text-[#5a1d2d] outline-none"
                  >
                    {locationOptions.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d4c56]">
                  Languages
                </div>
                <div className="rounded-xl border border-[#e5dbe0] bg-white p-2.5">
                  <div className="space-y-2 text-sm text-[#5a1d2d]">
                    {languageOptions.map((language) => (
                      <label key={language} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(language)}
                          onChange={() => toggleLanguage(language)}
                          className="h-4 w-4 accent-[#7a1f39]"
                        />
                        <span>{language}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d4c56]">
                  Interests
                </div>
                <div className="rounded-xl border border-[#e5dbe0] bg-white p-2.5">
                  <div className="space-y-2 text-sm text-[#5a1d2d]">
                    {interestOptions.map((interest) => (
                      <label key={interest} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedInterests.includes(interest)}
                          onChange={() => toggleInterest(interest)}
                          className="h-4 w-4 accent-[#7a1f39]"
                        />
                        <span>{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7a1f39] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#661b2f]"
            >
              Apply Filters
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

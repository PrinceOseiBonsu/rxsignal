"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, HeartPulse, Ribbon, Siren, Stethoscope, Plus, ArrowRight, Check } from "lucide-react";

const specialties = [
  { name: "Cardiology", icon: HeartPulse },
  { name: "Oncology", icon: Ribbon },
  { name: "Emergency Medicine", icon: Siren },
  { name: "Internal Medicine", icon: Stethoscope },
  { name: "Other", icon: Plus },
];

export default function OnboardingPage() {
  const [specialty, setSpecialty] = useState("");
  const router = useRouter();
  return (
    <div className="onboarding-page">
      <Link href="/onboarding" className="brand onboarding-brand" aria-label="RxSignal welcome"><span className="brand-icon"><Activity size={27} aria-hidden="true" /></span><span>RxSignal<span className="brand-dot">.</span></span></Link>
      <section className="onboarding-card" aria-labelledby="welcome-title">
        <p className="eyebrow">LESS SEARCHING. MORE CLARITY.</p>
        <h1 id="welcome-title">Never miss<br />what changed<span>.</span></h1>
        <p className="onboarding-value">Stay ahead of medication safety updates relevant to your practice.</p>
        <form onSubmit={(event) => { event.preventDefault(); if (specialty) router.push(`/dashboard?specialty=${encodeURIComponent(specialty)}`); }}>
          <fieldset>
            <legend>What’s your specialty?</legend>
            <p className="specialty-help">Choose a review lens for your workspace.</p>
            <div className="specialty-grid">
              {specialties.map(({ name, icon: Icon }) => (
                <label className={`specialty-card ${specialty === name ? "selected" : ""}`} key={name}>
                  <input type="radio" name="specialty" value={name} checked={specialty === name} onChange={() => setSpecialty(name)} required />
                  <Icon size={22} aria-hidden="true" /><span>{name}</span><span className="specialty-check" aria-hidden="true">{specialty === name && <Check size={12} />}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="onboarding-continue" disabled={!specialty}>Continue <ArrowRight size={18} aria-hidden="true" /></button>
        </form>
        <p className="onboarding-status">Continue to the live medication intelligence workspace</p>
        <p className="onboarding-note">Specialty selection adjusts workspace context. Signal evidence and priority remain unchanged.</p>
      </section>
      <p className="onboarding-footer">Medication intelligence. A clearer view of what matters.</p>
    </div>
  );
}

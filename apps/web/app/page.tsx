import Link from 'next/link';
import {
  HeartPulse,
  Stethoscope,
  ScanLine,
  Pill,
  MapPin,
  Shield,
  Wifi,
  WifiOff,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Stethoscope,
    title: 'AI Symptom Checker',
    description: 'Get an AI-powered health assessment based on your symptoms, medical history, and profile.',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-500/10',
  },
  {
    icon: ScanLine,
    title: 'Prescription Scanner',
    description: 'Scan prescriptions to find affordable Jan Aushadhi alternatives and save on medicines.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },
  {
    icon: Pill,
    title: 'Medicine Database',
    description: 'Search 150+ medicines with generic alternatives, pricing, uses, and side effects.',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },
  {
    icon: MapPin,
    title: 'Nearby Help',
    description: 'Find hospitals and pharmacies near you with directions and emergency contacts.',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
  },
];

const trustPoints = [
  { icon: Shield, label: 'Secure & Private', description: 'Your health data is encrypted and protected' },
  { icon: WifiOff, label: 'Works Offline', description: 'Core features available without internet' },
  { icon: Wifi, label: 'AI-Powered', description: 'Backed by advanced medical AI models' },
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <HeartPulse className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-tight">
              Rural Health AI
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Your trusted health companion. AI-powered symptom checking, prescription scanning, and affordable medicine access — online or offline.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
              >
                Sign in
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border-2 border-border text-foreground rounded-xl font-semibold hover:bg-secondary transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-200 hover:border-primary/20 group"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${f.bg} mb-4`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-border bg-secondary/20">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {trustPoints.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="text-center">
                  <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Rural Health AI. Built for better healthcare access.
          </p>
        </div>
      </footer>
    </div>
  );
}

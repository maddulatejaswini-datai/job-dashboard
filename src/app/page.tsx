import Dashboard from "@/components/Dashboard";
import { jobs } from "@/lib/jobs";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-[#3B342A]">
          Job Search Dashboard
        </h1>
        <p className="mt-2 text-[#6B5F4F]">{jobs.length} open postings.</p>
      </header>

      <Dashboard jobs={jobs} />
    </div>
  );
}

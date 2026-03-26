import { useEffect, useState } from "react";
import { useWebSocket } from "./useSocket";

function App() {
  const [now, setNow] = useState(new Date());
  const { sendMessage } = useWebSocket();

  // ── onSubmit: receives the final spoken text after silence ──────────────
  // Replace this handler's body with your real backend call later.
  const handleSubmit = (text: string) => {
    // ← swap this line for your fetch / WebSocket call
    sendMessage(text);
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const seconds = now.toLocaleTimeString([], { second: "2-digit" });
  const date = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen grid-cols-1 grid-rows-[auto_1fr_auto] gap-8 p-6 md:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:grid-rows-[auto_1fr]">
        {/* ── Left column ── */}
        <section className="flex flex-col justify-start lg:col-start-1 lg:row-span-2">
          {/* Clock */}
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-base-content/60">
              Smart Mirror
            </p>
            <div className="flex items-end gap-3">
              <h1 className="text-7xl font-extralight leading-none md:text-8xl lg:text-9xl">
                {time}
              </h1>
              <span className="pb-3 text-xl text-base-content/60 md:text-2xl">
                {seconds}
              </span>
            </div>
            <p className="text-lg text-base-content/70 md:text-2xl">{date}</p>
          </div>

          <div className="mt-10 hidden h-px w-32 bg-white/10 lg:block" />
          <button className="btn btn-xs" onClick={() => handleSubmit("hello")}>
            press me
          </button>
          {/* Cards row */}
          <div className="mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
            {/* Weather */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-base-content/50">
                Weather
              </p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-5xl font-light">68°</p>
                  <p className="mt-2 text-base-content/65">Clear skies</p>
                </div>
                <p className="text-sm text-base-content/50">H: 72° L: 55°</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Right column ── */}
        <aside className="grid gap-4 lg:col-start-2 lg:row-start-1 lg:self-start">
          {/* Today's schedule */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-base-content/50">
              Today
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                <div>
                  <p className="text-lg font-medium">Morning Workout</p>
                  <p className="text-sm text-base-content/55">Work</p>
                </div>
                <span className="text-sm text-base-content/65">9:00 AM</span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                <div>
                  <p className="text-lg font-medium">Gym</p>
                  <p className="text-sm text-base-content/55">Personal</p>
                </div>
                <span className="text-sm text-base-content/65">6:00 PM</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-medium">Read / Build</p>
                  <p className="text-sm text-base-content/55">Evening block</p>
                </div>
                <span className="text-sm text-base-content/65">8:30 PM</span>
              </div>
            </div>
          </div>

          {/* Focus */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-base-content/50">
              Focus
            </p>
            <div className="mt-4">
              <p className="text-2xl font-light">Keep it simple</p>
              <p className="mt-2 text-base-content/65">
                Hardware first. UI second.
              </p>
            </div>
          </div>
        </aside>

        <footer className="flex items-center justify-between text-sm text-base-content/45 lg:col-start-2 lg:row-start-2 lg:self-end">
          <span>Lorena&apos;s Mirror</span>
          <span>{now.toLocaleDateString()}</span>
        </footer>
      </div>
    </main>
  );
}

export default App;

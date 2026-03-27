import { useEffect, useState } from "react";
import { useWebSocket } from "./useSocket";

type CommandName = "weather_display" | "time_display";

type WebSocketMessage =
  | {
      type: "command";
      command: CommandName;
    }
  | {
      type: string;
      command?: string;
    };

type WeatherState = {
  temp: string;
  condition: string;
  high: string;
  low: string;
};

function App() {
  const [now, setNow] = useState<Date>(new Date());

  // If useWebSocket is not typed yet, this local cast keeps App.tsx happy.
  const { messages } = useWebSocket() as { messages: WebSocketMessage[] };

  const [showWeather, setShowWeather] = useState<boolean>(false);
  const [showTimePanel, setShowTimePanel] = useState<boolean>(false);

  const [weather] = useState<WeatherState>({
    temp: "68°",
    condition: "Clear skies",
    high: "72°",
    low: "55°",
  });

  useEffect(() => {
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!messages.length) return;

    const latest = messages[messages.length - 1];
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    if (latest.type === "command") {
      if (latest.command === "weather_display") {
        setShowWeather(true);
        setShowTimePanel(false);

        hideTimer = setTimeout(() => {
          setShowWeather(false);
        }, 10000);
      }

      if (latest.command === "time_display") {
        setShowTimePanel(true);
        setShowWeather(false);

        hideTimer = setTimeout(() => {
          setShowTimePanel(false);
        }, 10000);
      }
    }

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [messages]);

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const seconds = now.toLocaleTimeString([], {
    second: "2-digit",
  });

  const date = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen grid-cols-1 grid-rows-[auto_1fr_auto] gap-8 p-6 md:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:grid-rows-[auto_1fr]">
        <section className="flex flex-col justify-start lg:col-start-1 lg:row-span-2">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-white/60">
              Smart Mirror
            </p>

            <div className="flex items-end gap-3">
              <h1 className="text-7xl font-extralight leading-none md:text-8xl lg:text-9xl">
                {time}
              </h1>
              <span className="pb-3 text-xl text-white/60 md:text-2xl">
                {seconds}
              </span>
            </div>

            <p className="text-lg text-white/70 md:text-2xl">{date}</p>
          </div>

          <div className="mt-10 hidden h-px w-32 bg-white/10 lg:block" />

          <div className="mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
            {showWeather && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Weather
                </p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-5xl font-light">{weather.temp}</p>
                    <p className="mt-2 text-white/65">{weather.condition}</p>
                  </div>
                  <p className="text-sm text-white/50">
                    H: {weather.high} L: {weather.low}
                  </p>
                </div>
              </div>
            )}

            {showTimePanel && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Time
                </p>
                <div className="mt-4">
                  <p className="text-5xl font-light">{time}</p>
                  <p className="mt-2 text-white/65">{date}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="grid gap-4 lg:col-start-2 lg:row-start-1 lg:self-start">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Today
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                <div>
                  <p className="text-lg font-medium">Morning Workout</p>
                  <p className="text-sm text-white/55">Work</p>
                </div>
                <span className="text-sm text-white/65">9:00 AM</span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                <div>
                  <p className="text-lg font-medium">Gym</p>
                  <p className="text-sm text-white/55">Personal</p>
                </div>
                <span className="text-sm text-white/65">6:00 PM</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-medium">Read / Build</p>
                  <p className="text-sm text-white/55">Evening block</p>
                </div>
                <span className="text-sm text-white/65">8:30 PM</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Focus
            </p>
            <div className="mt-4">
              <p className="text-2xl font-light">Keep it simple</p>
              <p className="mt-2 text-white/65">Hardware first. UI second.</p>
            </div>
          </div>
        </aside>

        <footer className="flex items-center justify-between text-sm text-white/45 lg:col-start-2 lg:row-start-2 lg:self-end">
          <span>Lorena&apos;s Mirror</span>
          <span>{now.toLocaleDateString()}</span>
        </footer>
      </div>
    </main>
  );
}

export default App;

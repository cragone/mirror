import { useEffect, useState } from "react";
import { useWebSocket } from "./useSocket";

type WeatherState = {
  temp: string;
  condition: string;
  high: string;
  low: string;
};

function App() {
  const [now, setNow] = useState<Date>(new Date());
  const [isLightOn, setIsLightOn] = useState(false);
  const { mirrorState } = useWebSocket();

  const showWeather = mirrorState.weather_display;
  const showTimePanel = mirrorState.time_display;

  const [weather] = useState<WeatherState>({
    temp: "68°",
    condition: "Clear skies",
    high: "72°",
    low: "55°",
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function toggleLight() {
    const nextState = !isLightOn;
    const endpoint = nextState ? "light_on" : "light_off";

    try {
      const res = await fetch(`http://localhost:8000/${endpoint}`, {
        method: "GET",
      });

      const data = await res.json();
      console.log("Light response:", data);

      setIsLightOn(nextState);
    } catch (err) {
      console.error("Error toggling light:", err);
    }
  }

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
    <main
      className="min-h-screen bg-base-100 text-base-content"
      data-theme="mirror"
    >
      <div className="grid min-h-screen grid-cols-1 grid-rows-[auto_1fr_auto] gap-8 p-6 md:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:grid-rows-[auto_1fr]">
        <section className="flex flex-col justify-start lg:col-start-1 lg:row-span-2">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-secondary">
              Smart Mirror
            </p>

            {showTimePanel && (
              <>
                <div className="flex items-end gap-3">
                  <h1 className="text-7xl font-extralight leading-none text-base-content md:text-8xl lg:text-9xl">
                    {time}
                  </h1>
                  <span className="pb-3 text-xl text-secondary md:text-2xl">
                    {seconds}
                  </span>
                </div>
                <p className="text-lg text-base-content/70 md:text-2xl">
                  {date}
                </p>
              </>
            )}
          </div>

          {showWeather && (
            <>
              {showTimePanel && (
                <div className="mt-10 hidden h-px w-32 bg-base-300 lg:block" />
              )}

              <div className="mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-base-300 bg-neutral/60 p-5 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-secondary">
                    Weather
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-5xl font-light text-base-content">
                        {weather.temp}
                      </p>
                      <p className="mt-2 text-base-content/65">
                        {weather.condition}
                      </p>
                    </div>
                    <p className="text-sm text-secondary">
                      H: {weather.high} L: {weather.low}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <button className="btn btn-lg bg-primary" onClick={toggleLight}>
          {isLightOn ? "Lights Off" : "Lights On"}
        </button>

        <footer className="flex items-end justify-end text-lg text-secondary lg:col-start-2 lg:row-start-2 lg:self-end">
          <span>Tico&apos;s Mirror</span>
        </footer>
      </div>
    </main>
  );
}

export default App;

type Pollutant = "pm25" | "pm10";

type Breakpoint = {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
};

const PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0.0,   cHigh: 12.0,  iLow: 0,   iHigh: 50  },
  { cLow: 12.1,  cHigh: 35.4,  iLow: 51,  iHigh: 100 },
  { cLow: 35.5,  cHigh: 55.4,  iLow: 101, iHigh: 150 },
  { cLow: 55.5,  cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
  { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 }
];

const PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0,   cHigh: 54,  iLow: 0,   iHigh: 50  },
  { cLow: 55,  cHigh: 154, iLow: 51,  iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 504, iLow: 301, iHigh: 400 },
  { cLow: 505, cHigh: 604, iLow: 401, iHigh: 500 }
];

function truncatePM25(x: number) {
  return Math.trunc(x * 10) / 10; // đến 0.1 µg/m³
}
function truncatePM10(x: number) {
  return Math.trunc(x); // đến µg/m³ nguyên
}

function findBreakpoint(c: number, table: Breakpoint[]): Breakpoint | null {
  return table.find(b => c >= b.cLow && c <= b.cHigh) ?? null;
}

// Nội suy tuyến tính US EPA
function calcAQI(c: number, bp: Breakpoint): number {
  const { cLow, cHigh, iLow, iHigh } = bp;
  const aqi = ((iHigh - iLow) / (cHigh - cLow)) * (c - cLow) + iLow;
  return Math.round(aqi);
}

function aqiCategory(aqi: number) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

export function computeAQIFromPM(pm25: number | null, pm10: number | null) {
  const results: { pollutant: Pollutant; aqi: number }[] = [];

  if (pm25 != null) {
    const c = truncatePM25(pm25);
    const bp = findBreakpoint(c, PM25_BREAKPOINTS);
    if (bp) results.push({ pollutant: "pm25", aqi: calcAQI(c, bp) });
  }

  if (pm10 != null) {
    const c = truncatePM10(pm10);
    const bp = findBreakpoint(c, PM10_BREAKPOINTS);
    if (bp) results.push({ pollutant: "pm10", aqi: calcAQI(c, bp) });
  }

  if (results.length === 0) {
    return { aqi: NaN, dominant: null as null, category: "N/A" };
  }

  const dominant = results.reduce((a, b) => (b.aqi > a.aqi ? b : a));
  return {
    aqi: dominant.aqi,
    dominant: dominant.pollutant,
    category: aqiCategory(dominant.aqi),
    details: results // nếu muốn xem từng chất ô nhiễm
  };
}

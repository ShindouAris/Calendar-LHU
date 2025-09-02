import { WeatherCurrentAPIResponse } from "@/types/weather";
import { computeAQIFromPM } from "./aqiService";

const airQualityMessage = (aqi: number): string | null => {
    if (aqi <= 100) return null;
    if (aqi <= 150) return "😐 Chất lượng không khí khá tệ, người nhạy cảm nên đeo khẩu trang";
    if (aqi <= 200) return "😷 Chất lượng không khí kém, nên đeo khẩu trang khi đến trường";
    return "💀 Chất lượng không khí rất xấu, hãy đeo khẩu trang";
};

// ---- Nhóm nắng / UV ----
const uvMessage = (uv: number): string | null => {
    if (uv < 3) return null;
    const options = [
        "🕶️ UV cao, đeo kính râm khi ra ngoài",
        "☀️ Nắng gắt, nhớ thoa kem chống nắng hoặc mang áo khoác",
        "🌞 Nắng mạnh, mang theo mũ/nón để bảo vệ"
    ];
    return options[Math.floor(Math.random() * options.length)];
};

// ---- Nhóm mưa ----
const rainMessage = (rain: boolean, precip: number): string | null => {
    if (!rain && precip === 0) return null;
    if (precip > 7.5) {
        const options = [
            "⛈️ Mưa to, coi chừng ngập đường đi học",
            "⚠️ Trời mưa lớn, đi học nhớ đi sớm để khỏi kẹt",
            "🌊 Mưa nhiều, đường có thể trơn trượt"
        ];
        return options[Math.floor(Math.random() * options.length)];
    }
    return "🌧️ Có thể mưa, thủ sẵn áo mưa/dù";
};

// ---- Nhóm nhiệt độ ----
const tempMessage = (feelslike: number, windchill: number): string | null => {
    if (feelslike >= 35) {
        return "🥵 Trời oi bức, nhớ mang theo chai nước";
    }
    if (windchill <= 15) {
        return "🧥 Trời lạnh, mặc thêm áo khoác cho ấm";
    }
    return null;
};

// ---- Nhóm độ ẩm ----
const humidityMessage = (humidity: number): string | null => {
    if (humidity >= 85) {
        const options = [
            "💦 Độ ẩm cao, dễ cảm thấy ngột ngạt",
            "🥵 Trời ẩm ướt, ra ngoài sẽ hơi khó chịu",
            "🌫️ Ẩm nhiều, có thể có sương mù nhẹ"
        ];
        return options[Math.floor(Math.random() * options.length)];
    }
    return null;
};

export const get_warning = (weather_data: WeatherCurrentAPIResponse): string => {

    const weather = weather_data.current

    const aqi = computeAQIFromPM(weather.air_quality.pm2_5, weather.air_quality.pm10).aqi
    const uv = weather.uv
    const rain = weather.condition.text.toLowerCase().includes("mưa")
    const humidity = weather.humidity
    const windchill = weather.windchill_c
    const feelslike = weather.feelslike_c
    const precip = weather.precip_mm;


    const sections: { title: string; messages: (string | null)[] }[] = [
        { title: "🌍 Không khí", messages: [airQualityMessage(aqi)] },
        { title: "☀️ Nắng & UV", messages: [uvMessage(uv)] },
        { title: "🌧️ Mưa", messages: [rainMessage(rain, precip)] },
        { title: "🌡️ Nhiệt độ", messages: [tempMessage(feelslike, windchill)] },
        { title: "💦 Độ ẩm", messages: [humidityMessage(humidity)] },
    ];

    const output = sections
        .map(section => {
            const msgs = section.messages.filter(Boolean) as string[];
            if (msgs.length === 0) return null;
            return `${msgs.join("\n")}`;
        })
        .filter(Boolean)
        .join("\n");

    return output || "✅ Thời tiết ổn định, lên trường thoải mái 😎";
}
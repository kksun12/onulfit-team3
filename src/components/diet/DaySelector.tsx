"use client";

interface DaySelectorProps {
  selectedDay: number;
  onDaySelect: (day: number) => void;
}

export default function DaySelector({ selectedDay, onDaySelect }: DaySelectorProps) {
  const getDayName = (dayIndex: number) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[dayIndex];
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">요일 선택</h3>
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
          <button
            key={dayIndex}
            onClick={() => onDaySelect(dayIndex)}
            className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedDay === dayIndex
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {getDayName(dayIndex)}
          </button>
        ))}
      </div>
    </div>
  );
}
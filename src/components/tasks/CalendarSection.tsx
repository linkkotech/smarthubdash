import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * @file CalendarSection.tsx
 * @description Componente que exibe a seção de calendário e eventos agendados.
 *
 * @component CalendarSection
 * @returns {JSX.Element} A seção de calendário.
 */
export function CalendarSection(): JSX.Element {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekStartDate = startOfWeek(selectedDate, { locale: ptBR });

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStartDate, i));
  const dayAbbreviations = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

  const events = [
    {
      time: "04:30-05:00 PM",
      title: "Team meeting",
      details: "12:00 - 12:30 • CR design",
    },
    {
      time: "11:30-12:30 PM",
      title: "Meeting with new client",
      details: "12:30 - 06:30 PM • Job interview",
    },
  ];

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
        <CardTitle className="text-lg font-semibold">{format(selectedDate, "MMMM yyyy", { locale: ptBR })}</CardTitle>
        <div className="flex items-center">
          <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-center text-center">
          {weekDays.map((day) => (
            <div
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`cursor-pointer p-2 rounded-lg ${
                format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <p className="text-xs uppercase">{dayAbbreviations[day.getDay()]}</p>
              <p className="font-semibold mt-1">{format(day, "d")}</p>
            </div>
          ))}
        </div>
        <div className="space-y-4 mt-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="text-xs text-gray-500 w-24">{event.time}</div>
              <div className="flex-1 border-l-2 border-primary pl-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{event.title}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
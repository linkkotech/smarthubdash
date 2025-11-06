import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, List, LayoutGrid, Edit, Share } from "lucide-react";

/**
 * @file TodayTasksSection.tsx
 * @description Componente que exibe a seção de tarefas do dia na página de tarefas.
 *
 * @component TodayTasksSection
 * @returns {JSX.Element} A seção de tarefas do dia.
 */
export function TodayTasksSection(): JSX.Element {
  const tasks = [
    {
      title: "Conduct research",
      date: "4 May, 09:20 AM",
      duration: "02 h 45 m",
      progress: 90,
      range: "4 - 18",
    },
    {
      title: "Schedule a meeting",
      date: "4 May, 12:45 AM",
      duration: "06 h 55 m",
      progress: 50,
      range: "4 - 3 June",
    },
    {
      title: "Send out reminders",
      date: "21 May, 10:30 AM",
      duration: "01 h 30 m",
      progress: 10,
      range: "16 - 3 June",
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
        <div className="flex items-center">
          <CardTitle className="text-lg font-semibold">Today tasks</CardTitle>
          <div className="flex items-center ml-4">
            <Avatar className="h-6 w-6 border-2 border-white">
              <AvatarImage src="https://i.pravatar.cc/40?img=2" />
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <Avatar className="h-6 w-6 border-2 border-white -ml-2">
              <AvatarImage src="https://i.pravatar.cc/40?img=3" />
              <AvatarFallback>U2</AvatarFallback>
            </Avatar>
            <Avatar className="h-6 w-6 border-2 border-white -ml-2">
              <AvatarImage src="https://i.pravatar.cc/40?img=4" />
              <AvatarFallback>U3</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon"><List className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon"><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" className="text-sm text-gray-500"><Edit className="h-4 w-4 mr-2" /> Edit</Button>
          <Button variant="ghost" size="sm" className="text-sm text-gray-500"><Share className="h-4 w-4 mr-2" /> Share</Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center gap-4 p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
              <div className="w-4 h-4 border border-gray-300 rounded-none"></div>
              <div className="flex-1">
                <p className="font-medium text-sm">{task.title}</p>
                <p className="text-xs text-gray-500">{task.date}</p>
              </div>
              <div className="w-24">
                <p className="text-xs text-gray-500 text-right">Duration</p>
                <p className="font-medium text-sm text-right">{task.duration}</p>
              </div>
              <div className="w-32 flex items-center gap-2">
                <Progress value={task.progress} className="h-2" />
                <span className="text-xs font-medium">{task.progress}%</span>
              </div>
              <div className="text-xs text-gray-500">{task.range}</div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
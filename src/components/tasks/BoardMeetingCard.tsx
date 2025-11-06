import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Clock } from "lucide-react";

/**
 * @file BoardMeetingCard.tsx
 * @description Componente que exibe um card com detalhes de uma reunião.
 *
 * @component BoardMeetingCard
 * @returns {JSX.Element} O card de reunião.
 */
export function BoardMeetingCard(): JSX.Element {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Board meeting</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>March 24 at 5:00 PM</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Meeting with John Smith, 4th floor, room 101
        </p>
        <div className="flex items-center mt-4">
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarImage src="https://i.pravatar.cc/40?img=5" />
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
          <Avatar className="h-8 w-8 border-2 border-white -ml-2">
            <AvatarImage src="https://i.pravatar.cc/40?img=6" />
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="outline" size="sm">Reschedule</Button>
          <Button size="sm">Accept Invite</Button>
        </div>
      </CardContent>
    </Card>
  );
}
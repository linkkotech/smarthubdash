import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, MessageSquare, MoreHorizontal, Trash2, Edit } from "lucide-react";

/**
 * @file NotificationsSection.tsx
 * @description Componente que exibe a seção de notificações na página de tarefas,
 * incluindo eventos futuros e mensagens.
 *
 * @component NotificationsSection
 * @returns {JSX.Element} A seção de notificações.
 */
export function NotificationsSection(): JSX.Element {
  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
        <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
        <Button variant="ghost" size="sm" className="text-sm text-gray-500">
          Clear
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Upcoming Event Card */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-green-500 font-semibold flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  Upcoming event
                </p>
                <p className="text-sm font-medium mt-1">Landing page design</p>
                <p className="text-xs text-gray-500 mt-1">Time: 120 min</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Sat, 10 May</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>11 AM - 11:45 AM</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-500 cursor-pointer" />
                <Edit className="h-4 w-4 text-blue-500 cursor-pointer" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Card */}
        <div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Message | Product design</p>
                <p className="text-xs text-gray-500 mt-1">Message from Kate Smith</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
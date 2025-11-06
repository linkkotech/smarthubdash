import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Plus } from "lucide-react";

/**
 * @file AssignmentsSection.tsx
 * @description Componente que exibe a seção de atribuições (assignments) na página de tarefas.
 *
 * @component AssignmentsSection
 * @returns {JSX.Element} A seção de atribuições.
 */
export function AssignmentsSection(): JSX.Element {
  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
        <CardTitle className="text-lg font-semibold">Assignments</CardTitle>
        <Button variant="ghost" size="sm" className="text-sm text-gray-500">
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Assignment Card */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Motion design</Badge>
                <Badge variant="outline">Logo</Badge>
              </div>
              <p className="text-sm font-semibold mt-2">Design a packaging concept for a new product for test Product design</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Badge className="bg-red-100 text-red-700">High</Badge>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rachel Lee</span>
              <Avatar className="h-6 w-6">
                <AvatarImage src="https://i.pravatar.cc/40?img=1" alt="Rachel Lee" />
                <AvatarFallback>RL</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Add new assignment button */}
        <Button variant="outline" className="w-full mt-4 border-dashed">
          <Plus className="h-4 w-4 mr-2" />
          Add new assignment
        </Button>
      </CardContent>
    </Card>
  );
}
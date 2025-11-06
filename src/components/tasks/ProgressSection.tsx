import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * @file ProgressSection.tsx
 * @description Componente que exibe os cards de progresso circular.
 *
 * @component ProgressSection
 * @returns {JSX.Element} A seção de progresso.
 */
export function ProgressSection(): JSX.Element {
  // Dados mocados para os cards de progresso
  const progressData = [
    {
      title: "Marketing",
      percentage: 90,
      description: "You marked 5/5 all assignments are done!",
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Typography",
      percentage: 65,
      description: "You marked 3/5, 2 assignments left",
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {progressData.map((item, index) => (
        <Card key={index} className="w-full h-full">
          <CardContent className="p-4 text-center">
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className={item.color}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${item.percentage}, 100`}
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="text-xl font-bold">{item.percentage}%</span>
              </div>
            </div>
            <p className="font-semibold mt-2">{item.title}</p>
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            <Button size="sm" className="mt-3">Check</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
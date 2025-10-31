import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TeamMember } from "@/pages/client/columns";

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const navigate = useNavigate();
  // Calcular iniciais do nome
  const initials = member.full_name
    ? member.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <Card className="hover:shadow-lg transition-shadow border-gray-200 hover:border-gray-300">
      <CardContent className="flex flex-col items-center text-center gap-4 py-6 px-4">
        {/* Avatar Prominente com Badge de Status */}
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-gray-100">
            <AvatarImage src={member.avatarUrl} alt={member.full_name} />
            <AvatarFallback className="bg-gray-100 text-blue-700 text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Badge de Status */}
          <Badge 
            variant={member.status === "ativo" ? "default" : "secondary"}
            className={`absolute -top-2 -right-2 ${
              member.status === "ativo" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-400 text-white"
            }`}
          >
            {member.status === "ativo" ? "Ativo" : "Inativo"}
          </Badge>
        </div>

        {/* Nome em Destaque */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-blue-700">{member.full_name}</h3>
          <p className="text-sm text-gray-600">{member.cargo || "Sem cargo"}</p>
          <p className="text-xs text-gray-500">{member.unidade || "Sem unidade"}</p>
          <p className="text-xs text-gray-400 truncate max-w-xs">{member.email}</p>
        </div>

        {/* Botões de Ação */}
        <div className="flex w-full gap-2 pt-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate(`/app/equipe/${member.id}`)}
          >
            Ver Perfil
          </Button>
          <Button 
            variant="default"
            className="flex-1"
          >
            Conectar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

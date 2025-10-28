import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Link2 } from "lucide-react";

interface ProfileContent {
  name?: string;
  position?: string;
  company?: string;
  avatar_url?: string;
  plan_badge?: string;
}

interface ProfileCardProps {
  profile: {
    id: string;
    content: ProfileContent;
    status: string;
    short_id: string;
  };
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const { name, position, avatar_url, plan_badge } = profile.content;

  // Extrair iniciais do nome para o fallback do avatar
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewProfile = () => {
    console.log("Ver perfil:", profile.id);
    // TODO: Navegar para página de visualização ou abrir modal
  };

  const handleConnect = () => {
    console.log("Conectar com perfil:", profile.short_id);
    // TODO: Copiar link ou abrir QR Code
  };

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="flex-col items-center space-y-3 pb-4">
        {/* Avatar */}
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatar_url} alt={name || "Perfil"} />
          <AvatarFallback className="text-lg font-semibold">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        {/* Badge do Plano */}
        <Badge variant="secondary" className="text-xs">
          {plan_badge || "BÁSICO"}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 text-center space-y-1 pb-4">
        {/* Nome */}
        <h3 className="font-semibold text-base leading-tight line-clamp-2">
          {name || "Sem nome"}
        </h3>

        {/* Cargo */}
        <p className="text-sm text-muted-foreground line-clamp-1">
          {position || "Cargo não informado"}
        </p>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        {/* Botão Ver Perfil */}
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleViewProfile}
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver Perfil
        </Button>

        {/* Botão Conectar */}
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={handleConnect}
        >
          <Link2 className="h-4 w-4 mr-1" />
          Conectar
        </Button>
      </CardFooter>
    </Card>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * @typedef {object} ContactProfileProps
 * @property {string} name - Nome do contato
 * @property {string} [avatar] - URL da imagem do avatar
 * @property {string} [status] - Status do contato (ex: "Applied a week ago")
 */

/**
 * Componente ContactProfile
 * 
 * Renderiza o perfil resumido do contato no topo do painel de detalhes.
 * Exibe avatar ampliado, nome e status.
 * 
 * @param {ContactProfileProps} props - As props do componente
 * @returns {JSX.Element} O perfil do contato
 */
export function ContactProfile({
  name,
  avatar,
  status,
}: {
  name: string;
  avatar?: string;
  status?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 text-center border-b">
      <Avatar className="h-20 w-20">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="text-lg">
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-semibold text-lg">{name}</h3>
        {status && (
          <p className="text-xs text-muted-foreground">{status}</p>
        )}
      </div>
    </div>
  );
}
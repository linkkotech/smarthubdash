import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactInformation } from "./ContactInformation";
import { ActivityHistory } from "./ActivityHistory";
import { NotesSection } from "./NotesSection";
import type { Activity, Note } from "@/types/chat";

interface ContactDetailsCardProps {
  /** Email do contato */
  email?: string;
  /** Telefone do contato */
  phone?: string;
  /** Endereço do contato */
  address?: string;
  /** Usuário Skype do contato */
  skype?: string;
  /** Lista de atividades do contato */
  activities?: Activity[];
  /** Lista de notas do contato */
  notes?: Note[];
}

/**
 * Componente ContactDetailsCard
 *
 * Renderiza um card unificado com abas para exibir todas as informações
 * detalhadas de um contato, incluindo dados de contato, histórico de atividades e notas.
 * O design das abas é inspirado no componente de login, para consistência visual.
 *
 * @param {ContactDetailsCardProps} props - As props do componente.
 * @returns {JSX.Element} Um card com abas para os detalhes do contato.
 */
export function ContactDetailsCard({
  email,
  phone,
  address,
  skype,
  activities = [],
  notes = [],
}: ContactDetailsCardProps) {
  return (
    <Card className="w-full p-2">
      <Tabs defaultValue="details" className="w-full">
        <div className="bg-gray-100 rounded-lg">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Atividades
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Notas
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="p-4">
          <TabsContent value="details">
            <ContactInformation email={email} phone={phone} address={address} skype={skype} />
          </TabsContent>
          <TabsContent value="activities">
            <ActivityHistory activities={activities} />
          </TabsContent>
          <TabsContent value="notes">
            <NotesSection notes={notes} />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
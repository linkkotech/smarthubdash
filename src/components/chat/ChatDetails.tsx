import { ScrollArea } from "@/components/ui/scroll-area";
import { ContactProfile } from "./ContactProfile";
import { LeadJourney } from "./LeadJourney";
import { LeadStatusProgress } from "./LeadStatusProgress";
import { ContactDetailsCard } from "./ContactDetailsCard";
import type { Activity, Note, KanbanStatus } from "@/types/chat";

/**
 * @typedef {object} ChatDetailsProps
 * @property {string} contactName - Nome/razão social do contato ou empresa lead
 * @property {string} [contactAvatar] - URL de avatar/logo do contato/empresa
 * @property {string} [contactStatus] - Status textual adicional (ex: "Lead ativo", "Em negociação")
 * @property {string} [position] - Cargo/posição do contato dentro da empresa (ex: "Gerente de TI")
 * @property {string} [company] - Nome da empresa do lead (ex: "Tech Corp S/A")
 * @property {string} [location] - Localização geográfica (ex: "São Paulo, SP", "Brasil")
 * @property {string} [employmentType] - Tipo de emprego (ex: "Full-time", "CLT", "PJ")
 * @property {KanbanStatus} [kanbanStatus] - Status do Kanban: 'prospect'|'qualified_lead'|'opportunity'|'negotiation'|'closed'
 * @property {(status: KanbanStatus) => void} [onStatusChange] - Disparado ao mudar kanbanStatus
 * @property {string} [email] - Email corporativo/pessoal para contato
 * @property {string} [phone] - Telefone de contato com DDD (ex: "+55 11 99999-9999")
 * @property {string} [address] - Endereço completo do contato/empresa
 * @property {string} [skype] - ID/usuário Skype para comunicação
 * @property {Activity[]} [activities] - Array de atividades registradas do lead (histórico)
 * @property {Note[]} [notes] - Array de notas textuais criadas sobre o lead
 * @property {(content: string) => void} [onAddNote] - Disparado ao criar nova nota (arg: texto)
 */

/**
 * Componente ChatDetails
 *
 * Painel de detalhes do lead (25% da largura) localizado à direita do layout.
 * Exibe informações completas do contato/lead com scroll vertical interno.
 *
 * **Seções Verticais (dentro do ScrollArea):**
 * 1. ContactProfile - Avatar ampliado, nome e status
 * 2. LeadJourney - Cargo, empresa, localização (condicional se position existir)
 * 3. LeadStatusProgress - Barra de progresso Kanban 5 estágios
 * 4. ContactTabs - Abas para "Detalhes do Contato" e "Atividades"
 * 5. NotesSection - Campo de notas com textarea e botão "Adicionar Nota"
 *
 * **Design:**
 * - Fundo branco (`bg-white`) recebe sombra do ChatLayout
 * - ScrollArea para conteúdo interno (flex-1), sem overflow hidden
 * - Cards/sections com espaçamento padding p-4 e gap vertical space-y-4
 * - Rounded corners nas extremidades (r-lg) definidas pelo ChatLayout
 *
 * **Comportamento:**
 * - LeadJourney renderizado apenas se prop `position` informada
 * - ContactTabs integra email, phone, address, skype, activities
 * - NotesSection permite adicionar notas via onAddNote callback
 * - KanbanStatus mudável via onStatusChange ao clicar em badge no status
 *
 * @param {ChatDetailsProps} props - Props do componente
 * @returns {JSX.Element} Painel direito branco com scroll de seções de lead
 */
export function ChatDetails({
  contactName,
  contactAvatar,
  contactStatus,
  position,
  company,
  location,
  employmentType,
  kanbanStatus = "prospect",
  onStatusChange,
  email,
  phone,
  address,
  skype,
  activities = [],
  notes = [],
  onAddNote,
}: {
  contactName: string;
  contactAvatar?: string;
  contactStatus?: string;
  position?: string;
  company?: string;
  location?: string;
  employmentType?: string;
  kanbanStatus?: KanbanStatus;
  onStatusChange?: (status: KanbanStatus) => void;
  email?: string;
  phone?: string;
  address?: string;
  skype?: string;
  activities?: Activity[];
  notes?: Note[];
  onAddNote?: (content: string) => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {/* Contact Profile */}
          <ContactProfile
            name={contactName}
            avatar={contactAvatar}
            status={contactStatus}
          />

          {/* Lead Journey */}
          {position && (
            <LeadJourney
              position={position}
              company={company}
              location={location}
              employmentType={employmentType}
            />
          )}

          {/* Lead Status Progress */}
          <LeadStatusProgress
            currentStatus={kanbanStatus}
            onStatusChange={onStatusChange}
            statusLabel="Novo Lead"
          />

          {/* Contact Details Card */}
          <ContactDetailsCard
            email={email}
            phone={phone}
            address={address}
            skype={skype}
            activities={activities}
            notes={notes}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
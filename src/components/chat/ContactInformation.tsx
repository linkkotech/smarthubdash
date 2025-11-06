import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

/**
 * @typedef {object} ContactInformationProps
 * @property {string} [email] - Email corporativo/pessoal do contato (renderiza icon Mail)
 * @property {string} [phone] - Telefone com DDD do contato (renderiza icon Phone)
 * @property {string} [address] - Endereço postal completo do contato (renderiza icon MapPin)
 * @property {string} [skype] - ID/usuário Skype do contato (renderiza icon MessageSquare)
 */

/**
 * Componente ContactInformation
 *
 * Card que exibe informações de contato estruturadas com ícones visuais.
 * Renderizado dentro da aba "Detalhes do Contato" no componente ContactTabs.
 * Todas as props são opcionais - apenas renderiza seções com dados informados.
 *
 * **Estrutura Visual:**
 * - Card wrapper com CardContent
 * - Space-y-3 entre cada campo de contato
 * - Cada campo: flex (ícone + conteúdo)
 *
 * **Campos (se informados):**
 * 1. **Email** (Mail icon)
 *    - Label: "Email" (bold text-xs)
 *    - Value: email com break-all para URLs longas
 *
 * 2. **Phone** (Phone icon)
 *    - Label: "Phone" (bold text-xs)
 *    - Value: texto do telefone
 *
 * 3. **Address** (MapPin icon)
 *    - Label: "Address" (bold text-xs)
 *    - Value: endereço completo
 *
 * 4. **Skype** (MessageSquare icon)
 *    - Label: "Skype" (bold text-xs)
 *    - Value: usuário Skype
 *
 * **Design:**
 * - Ícones: h-4 w-4, flex-shrink-0, mt-1, muted-foreground
 * - Labels: text-xs font-semibold
 * - Values: text-xs text-muted-foreground
 * - Padding pt-4 (CardContent padrão)
 * - Email com break-all, outros com default wrapping
 *
 * **Integração:**
 * - Renderizado em ContactTabs aba "Detalhes do Contato"
 * - Props fornecidas pelo ChatDetails parent
 * - Renderização conditinal: cada campo renderizado apenas se prop informada
 *
 * @param {ContactInformationProps} props - Props do componente (todas opcionais)
 * @returns {JSX.Element} Card com informações de contato estruturadas com ícones
 */
export function ContactInformation({
  email,
  phone,
  address,
  skype,
}: {
  email?: string;
  phone?: string;
  address?: string;
  skype?: string;
}) {
  return (
    <div className="space-y-3">
      {email && (
        <div className="flex items-start gap-3">
          <Mail className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold">Email</p>
            <p className="text-xs text-muted-foreground break-all">{email}</p>
          </div>
        </div>
      )}

      {phone && (
        <div className="flex items-start gap-3">
          <Phone className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold">Phone</p>
            <p className="text-xs text-muted-foreground">{phone}</p>
          </div>
        </div>
      )}

      {address && (
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold">Address</p>
            <p className="text-xs text-muted-foreground">{address}</p>
          </div>
        </div>
      )}

      {skype && (
        <div className="flex items-start gap-3">
          <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold">Skype</p>
            <p className="text-xs text-muted-foreground">{skype}</p>
          </div>
        </div>
      )}
    </div>
  );
}
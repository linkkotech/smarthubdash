import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * @typedef {object} LeadJourneyProps
 * @property {string} position - Posição/cargo do lead
 * @property {string} [company] - Empresa onde o lead trabalha
 * @property {string} [location] - Localidade/localização
 * @property {string} [employmentType] - Tipo de emprego (Full Time, Part Time, etc)
 */

/**
 * Componente LeadJourney
 * 
 * Renderiza a jornada do lead no CRM, exibindo informações sobre
 * sua posição, empresa, localização e tipo de emprego.
 * 
 * @param {LeadJourneyProps} props - As props do componente
 * @returns {JSX.Element} A seção de jornada do lead
 */
export function LeadJourney({
  position,
  company,
  location,
  employmentType,
}: {
  position: string;
  company?: string;
  location?: string;
  employmentType?: string;
}) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="text-sm font-semibold mb-2">Lead Journey</h3>
      <div className="text-xs text-muted-foreground">
        {employmentType && location && (
          <p>
            {employmentType} • {location}
          </p>
        )}
        {company && <p>Company: {company}</p>}
      </div>
    </div>
  );
}
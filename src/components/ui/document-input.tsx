/**
 * @fileoverview Componente de Input com máscara para CPF ou CNPJ
 * 
 * Aplica automaticamente a máscara correta baseado no tipo de cliente selecionado:
 * - Pessoa Física: ###.###.###-## (11 dígitos)
 * - Pessoa Jurídica: ##.###.###/####-## (14 dígitos)
 * 
 * O componente também remove a máscara ao enviar o valor para o formulário,
 * mas a exibe formatada para o usuário durante a digitação.
 */

import * as React from "react";
import { Input } from "@/components/ui/input";
import type { ClientType } from "@/integrations/supabase/types/workspace.types";

/**
 * Props do DocumentInput
 * 
 * @interface DocumentInputProps
 * @extends {React.InputHTMLAttributes<HTMLInputElement>}
 * 
 * @property {ClientType} clientType - Tipo de cliente para determinar a máscara (CPF ou CNPJ)
 * @property {string} [value] - Valor atual do documento (pode estar mascarado ou não)
 * @property {(value: string) => void} [onChange] - Callback quando o valor muda (recebe valor SEM máscara)
 */
export interface DocumentInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  clientType: ClientType;
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * Aplica máscara de CPF
 * 
 * Formato: ###.###.###-##
 * Exemplo: 12345678909 → 123.456.789-09
 * 
 * @param {string} value - Valor sem máscara (apenas números)
 * @returns {string} Valor com máscara de CPF
 */
function applyCpfMask(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Aplica a máscara progressivamente
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
  }
}

/**
 * Aplica máscara de CNPJ
 * 
 * Formato: ##.###.###/####-##
 * Exemplo: 12345678000190 → 12.345.678/0001-90
 * 
 * @param {string} value - Valor sem máscara (apenas números)
 * @returns {string} Valor com máscara de CNPJ
 */
function applyCnpjMask(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 14 dígitos
  const limited = numbers.slice(0, 14);
  
  // Aplica a máscara progressivamente
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 5) {
    return `${limited.slice(0, 2)}.${limited.slice(2)}`;
  } else if (limited.length <= 8) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
  } else if (limited.length <= 12) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
  } else {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
  }
}

/**
 * Remove a máscara do documento
 * 
 * Remove todos os caracteres que não são números.
 * 
 * @param {string} value - Valor com máscara
 * @returns {string} Valor sem máscara (apenas números)
 * 
 * @example
 * removeMask("123.456.789-09") // "12345678909"
 * removeMask("12.345.678/0001-90") // "12345678000190"
 */
function removeMask(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * DocumentInput Component
 * 
 * Campo de input que aplica automaticamente a máscara de CPF ou CNPJ
 * baseado no tipo de cliente selecionado.
 * 
 * Funcionalidades:
 * - Máscara automática durante a digitação
 * - Troca de máscara ao mudar o tipo de cliente
 * - Retorna valor sem máscara para o formulário
 * - Validação de comprimento (11 dígitos CPF, 14 dígitos CNPJ)
 * 
 * @component
 * 
 * @example
 * // Uso com React Hook Form
 * <DocumentInput
 *   clientType="pessoa_fisica"
 *   value={field.value}
 *   onChange={(value) => field.onChange(value)}
 *   placeholder="000.000.000-00"
 * />
 * 
 * @example
 * // Uso standalone
 * const [document, setDocument] = useState("");
 * <DocumentInput
 *   clientType="pessoa_juridica"
 *   value={document}
 *   onChange={setDocument}
 *   placeholder="00.000.000/0000-00"
 * />
 */
export const DocumentInput = React.forwardRef<HTMLInputElement, DocumentInputProps>(
  ({ clientType, value = "", onChange, ...props }, ref) => {
    // Estado interno para armazenar o valor mascarado (para exibição)
    const [displayValue, setDisplayValue] = React.useState("");

    // Atualiza o valor mascarado quando o valor ou tipo de cliente mudam
    React.useEffect(() => {
      const cleanValue = removeMask(value);
      const masked = clientType === 'pessoa_fisica' 
        ? applyCpfMask(cleanValue)
        : applyCnpjMask(cleanValue);
      setDisplayValue(masked);
    }, [value, clientType]);

    /**
     * Handler do input
     * 
     * Aplica a máscara e notifica o componente pai com o valor limpo.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Remove a máscara
      const cleanValue = removeMask(inputValue);
      
      // Aplica a máscara apropriada
      const masked = clientType === 'pessoa_fisica'
        ? applyCpfMask(inputValue)
        : applyCnpjMask(inputValue);
      
      // Atualiza o display
      setDisplayValue(masked);
      
      // Notifica o componente pai com o valor SEM máscara
      if (onChange) {
        onChange(cleanValue);
      }
    };

    // Determina o placeholder baseado no tipo
    const placeholder = clientType === 'pessoa_fisica'
      ? "000.000.000-00"
      : "00.000.000/0000-00";

    // Determina o maxLength baseado no tipo (com máscara)
    const maxLength = clientType === 'pessoa_fisica' ? 14 : 18;

    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={props.placeholder || placeholder}
        maxLength={maxLength}
        {...props}
      />
    );
  }
);

DocumentInput.displayName = "DocumentInput";

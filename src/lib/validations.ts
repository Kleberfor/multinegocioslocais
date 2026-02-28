import { z } from "zod";

// Validação de CPF
function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;

  return true;
}

// Validação de CNPJ
function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/\D/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

// Validação de CPF ou CNPJ
function isValidCpfCnpj(value: string): boolean {
  const clean = value.replace(/\D/g, "");
  if (clean.length === 11) return isValidCPF(clean);
  if (clean.length === 14) return isValidCNPJ(clean);
  return false;
}

// Schema de dados do cliente
export const clienteSchema = z.object({
  // Dados pessoais
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z
    .string()
    .min(10, "Telefone inválido")
    .regex(/^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/, "Formato de telefone inválido"),
  cpfCnpj: z
    .string()
    .min(11, "CPF/CNPJ inválido")
    .refine(isValidCpfCnpj, "CPF/CNPJ inválido"),

  // Dados do negócio
  negocio: z.string().min(2, "Nome do negócio é obrigatório"),

  // Endereço
  endereco: z.object({
    cep: z.string().min(8, "CEP inválido"),
    logradouro: z.string().min(3, "Logradouro é obrigatório"),
    numero: z.string().min(1, "Número é obrigatório"),
    complemento: z.string().optional(),
    bairro: z.string().min(2, "Bairro é obrigatório"),
    cidade: z.string().min(2, "Cidade é obrigatória"),
    estado: z.string().length(2, "Estado inválido"),
  }),

  // Plano
  planoId: z.string().min(1, "Selecione uma forma de pagamento"),

  // Valor personalizado (quando planoId = "plano-customizado")
  valorCustomizado: z.number().optional(),

  // ID do prospect (se veio da análise)
  prospectId: z.string().optional(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;

// Schema para criação de cliente (API)
export const createClienteSchema = clienteSchema;

// Formatadores
export function formatCpfCnpj(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length <= 11) {
    // CPF: 000.000.000-00
    return clean
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    // CNPJ: 00.000.000/0000-00
    return clean
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }
}

export function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length <= 10) {
    return clean
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    return clean
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }
}

export function formatCep(value: string): string {
  const clean = value.replace(/\D/g, "");
  return clean.replace(/(\d{5})(\d)/, "$1-$2");
}

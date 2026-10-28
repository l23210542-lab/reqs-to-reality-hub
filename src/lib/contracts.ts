import { supabase } from "./supabase";

export interface Contract {
  id: string;
  user_id: string;
  titulo: string;
  codigo_fuente: string;
  created_at: string;
  updated_at: string;
}

const TABLE = "contratos";

export async function listContracts(): Promise<Contract[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as Contract[];
}

export async function getContract(id: string): Promise<Contract | null> {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Contract | null;
}

export async function insertContract(titulo: string, codigoFuente: string): Promise<Contract> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ titulo, codigo_fuente: codigoFuente })
    .select()
    .single();
  if (error) throw error;
  return data as Contract;
}

export async function updateContract(
  id: string,
  patch: Partial<Pick<Contract, "titulo" | "codigo_fuente">>,
): Promise<Contract> {
  const { data, error } = await supabase.from(TABLE).update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as Contract;
}

export async function deleteContract(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

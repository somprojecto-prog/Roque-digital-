"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useManagerAuth } from "@/contexts/ManagerAuthContext";
import type { Customer, Profile, ProfileRole } from "@/types/database";

const ROLES: ProfileRole[] = ["pendente", "admin", "gestor", "funcionario", "armazem", "marketing"];

export default function ManagerEquipaPage() {
  const { profile: me } = useManagerAuth();
  const podeEditar = me?.role === "admin";

  const [team, setTeam] = useState<Profile[] | null>(null);
  const [registeredCustomers, setRegisteredCustomers] = useState<Customer[] | null>(null);

  const load = async () => {
    const [{ data: profiles }, { data: customers }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("customers").select("*").not("auth_user_id", "is", null).order("created_at", { ascending: false }),
    ]);
    setTeam(profiles || []);
    setRegisteredCustomers(customers || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (id: string, novoPapel: ProfileRole) => {
    if (!confirm(`Mudar a função desta conta para "${novoPapel}"?`)) {
      load();
      return;
    }
    const { error } = await supabase.from("profiles").update({ role: novoPapel }).eq("id", id);
    if (error) {
      alert("Não foi possível alterar (só o Admin pode fazer isto).");
      load();
      return;
    }
    load();
  };

  const handlePromote = async (customer: Customer) => {
    const papel = prompt(
      "Promover para que função? (admin, gestor, funcionario, armazem, marketing)",
      "gestor"
    );
    if (!papel) return;
    if (!ROLES.includes(papel as ProfileRole) || papel === "pendente") {
      alert("Função inválida.");
      return;
    }
    const { error } = await supabase.from("profiles").insert({
      id: customer.auth_user_id,
      full_name: customer.full_name,
      email: customer.email,
      role: papel,
    });
    if (error) {
      alert("Não foi possível promover: " + error.message);
      return;
    }
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-creme">Equipa</h1>
      <p className="mt-1 text-sm text-creme/50">Contas com acesso ao painel. Só o Admin pode alterar funções.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cacau/70 bg-cacau-dark">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="text-xs text-creme/40">
              <th className="p-3 font-normal">Nome</th>
              <th className="p-3 font-normal">Email</th>
              <th className="p-3 font-normal">Função</th>
            </tr>
          </thead>
          <tbody>
            {team === null ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-creme/40">
                  A carregar…
                </td>
              </tr>
            ) : (
              team.map((u) => (
                <tr key={u.id} className="border-t border-creme/5 text-creme/80">
                  <td className="p-3">
                    {u.full_name}
                    {u.role === "pendente" && (
                      <span className="ml-2 rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] text-yellow-400">
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-creme/50">{u.email}</td>
                  <td className="p-3">
                    {podeEditar ? (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as ProfileRole)}
                        className="rounded-lg border border-creme/15 bg-cacau-darker px-2 py-1 text-xs text-creme"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="rounded-full bg-creme/10 px-2 py-0.5 text-xs">{u.role}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-xl text-creme">Clientes registados</h2>
      <p className="mt-1 text-sm text-creme/50">
        Contas criadas na loja. O Admin pode promover qualquer uma a colaborador.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cacau/70 bg-cacau-dark">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="text-xs text-creme/40">
              <th className="p-3 font-normal">Nome</th>
              <th className="p-3 font-normal">Email</th>
              <th className="p-3 font-normal">Telefone</th>
              <th className="p-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {registeredCustomers === null ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-creme/40">
                  A carregar…
                </td>
              </tr>
            ) : registeredCustomers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-creme/40">
                  Ainda não há clientes registados.
                </td>
              </tr>
            ) : (
              registeredCustomers.map((c) => (
                <tr key={c.id} className="border-t border-creme/5 text-creme/80">
                  <td className="p-3">{c.full_name || "—"}</td>
                  <td className="p-3 text-creme/50">{c.email || "—"}</td>
                  <td className="p-3 text-creme/50">{c.phone || "—"}</td>
                  <td className="p-3 text-right">
                    {podeEditar && (
                      <button onClick={() => handlePromote(c)} className="text-xs text-laranja">
                        Promover a colaborador
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

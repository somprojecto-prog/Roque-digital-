"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PaymentMethod, ProofMode } from "@/types/database";

export default function ManagerPagamentosPage() {
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [proofMode, setProofMode] = useState<ProofMode>("none");
  const [proofLabel, setProofLabel] = useState("");
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("payment_methods")
      .select("*")
      .order("created_at", { ascending: true });
    setMethods(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setInstructions("");
    setProofMode("none");
    setProofLabel("");
  };

  const handleEdit = (m: PaymentMethod) => {
    setEditId(m.id);
    setName(m.name);
    setInstructions(m.instructions || "");
    setProofMode(m.proof_mode);
    setProofLabel(m.proof_label || "");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setStatus({ text: "Escreve o nome da forma de pagamento.", ok: false });
      return;
    }
    const payload = {
      name: name.trim(),
      instructions: instructions.trim(),
      proof_mode: proofMode,
      proof_label: proofLabel.trim() || null,
    };
    const { error } = editId
      ? await supabase.from("payment_methods").update(payload).eq("id", editId)
      : await supabase.from("payment_methods").insert({ ...payload, active: true });

    if (error) {
      setStatus({ text: error.message, ok: false });
      return;
    }
    setStatus({ text: editId ? "Alterações guardadas!" : "Forma de pagamento adicionada!", ok: true });
    resetForm();
    load();
  };

  const toggleActive = async (m: PaymentMethod) => {
    await supabase.from("payment_methods").update({ active: !m.active }).eq("id", m.id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apagar esta forma de pagamento?")) return;
    await supabase.from("payment_methods").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-creme">Formas de pagamento</h1>
      <p className="mt-1 max-w-xl text-sm text-creme/50">
        Aparecem no carrinho, no passo de finalizar compra. Podes ter quantas quiseres.
      </p>

      <div className="mt-6 max-w-lg rounded-2xl border border-cacau/70 bg-cacau-dark p-5">
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Pagamento na entrega"
            className="input-field"
          />
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            placeholder="Ex: Paga em dinheiro ou Multicaixa quando a encomenda chegar."
            className="input-field"
          />
          <select
            value={proofMode}
            onChange={(e) => setProofMode(e.target.value as ProofMode)}
            className="input-field"
          >
            <option value="none">Não pede comprovativo</option>
            <option value="optional">Pede comprovativo (opcional)</option>
            <option value="required">Pede comprovativo (obrigatório)</option>
          </select>
          <input
            value={proofLabel}
            onChange={(e) => setProofLabel(e.target.value)}
            placeholder="Texto do comprovativo (opcional)"
            className="input-field"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 rounded-full bg-laranja py-2.5 text-sm font-semibold text-preto"
            >
              {editId ? "Guardar alterações" : "+ Adicionar forma de pagamento"}
            </button>
            {editId && (
              <button
                onClick={resetForm}
                className="rounded-full border border-creme/20 px-4 text-sm text-creme/70"
              >
                Cancelar
              </button>
            )}
          </div>
          {status && (
            <p className={`text-center text-xs ${status.ok ? "text-green-400" : "text-red-400"}`}>
              {status.text}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cacau/70 bg-cacau-dark">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="text-xs text-creme/40">
              <th className="p-3 font-normal">Nome</th>
              <th className="p-3 font-normal">Instruções</th>
              <th className="p-3 font-normal">Comprovativo?</th>
              <th className="p-3 font-normal">Ativo</th>
              <th className="p-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {methods === null ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-creme/40">
                  A carregar…
                </td>
              </tr>
            ) : methods.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-creme/40">
                  Sem formas de pagamento.
                </td>
              </tr>
            ) : (
              methods.map((m) => (
                <tr key={m.id} className="border-t border-creme/5 text-creme/80">
                  <td className="p-3">{m.name}</td>
                  <td className="max-w-[240px] p-3 text-creme/50">{m.instructions}</td>
                  <td className="p-3 text-creme/50">
                    {m.proof_mode === "none" ? "Não" : m.proof_mode === "optional" ? "Opcional" : "Obrigatório"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleActive(m)}
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        m.active ? "bg-green-500/15 text-green-400" : "bg-creme/10 text-creme/40"
                      }`}
                    >
                      {m.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleEdit(m)} className="mr-3 text-xs text-laranja">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="text-xs text-red-400">
                      Apagar
                    </button>
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

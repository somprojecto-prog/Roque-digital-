"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

async function uploadArquivo(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const nome = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("imagens").upload(nome, file);
  if (error) throw error;
  return supabase.storage.from("imagens").getPublicUrl(nome).data.publicUrl;
}

export default function ManagerConteudoPage() {
  const [form, setForm] = useState({
    nome_site: "",
    slogan: "",
    hero_titulo: "",
    hero_descricao: "",
    rodape_texto: "",
    contacto_telefone: "",
    contacto_email: "",
    contacto_whatsapp: "",
    contacto_morada: "",
    redes_instagram: "",
    redes_facebook: "",
    taxa_entrega: "2000",
    cor_destaque: "#D9731A",
    cor_destaque_clara: "#EB8B3A",
    cor_fundo: "#170A02",
    destaque_titulo: "",
    destaque_descricao: "",
    destaque_preco: "",
    emailjs_public_key: "",
    emailjs_service_id: "",
    emailjs_template_id: "",
  });
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setForm({
          nome_site: data.nome_site || "",
          slogan: data.slogan || "",
          hero_titulo: data.hero_titulo || "",
          hero_descricao: data.hero_descricao || "",
          rodape_texto: data.rodape_texto || "",
          contacto_telefone: data.contacto_telefone || "",
          contacto_email: data.contacto_email || "",
          contacto_whatsapp: data.contacto_whatsapp || "",
          contacto_morada: data.contacto_morada || "",
          redes_instagram: data.redes_instagram || "",
          redes_facebook: data.redes_facebook || "",
          taxa_entrega: data.taxa_entrega != null ? String(data.taxa_entrega) : "2000",
          cor_destaque: data.cor_destaque || "#D9731A",
          cor_destaque_clara: data.cor_destaque_clara || "#EB8B3A",
          cor_fundo: data.cor_fundo || "#170A02",
          destaque_titulo: data.destaque_titulo || "",
          destaque_descricao: data.destaque_descricao || "",
          destaque_preco: data.destaque_preco != null ? String(data.destaque_preco) : "",
          emailjs_public_key: data.emailjs_public_key || "",
          emailjs_service_id: data.emailjs_service_id || "",
          emailjs_template_id: data.emailjs_template_id || "",
        });
        setVideoUrl(data.destaque_video_url || null);
      });
  }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUploading(true);
    try {
      setVideoUrl(await uploadArquivo(file));
    } catch (err) {
      setStatus({ text: err instanceof Error ? err.message : "Erro ao enviar vídeo.", ok: false });
    } finally {
      setVideoUploading(false);
    }
  };

  const handleSave = async () => {
    const payload = {
      nome_site: form.nome_site.trim() || "Roque Digital",
      slogan: form.slogan.trim(),
      hero_titulo: form.hero_titulo.trim(),
      hero_descricao: form.hero_descricao.trim(),
      rodape_texto: form.rodape_texto.trim(),
      contacto_telefone: form.contacto_telefone.trim() || null,
      contacto_email: form.contacto_email.trim() || null,
      contacto_whatsapp: form.contacto_whatsapp.replace(/\D/g, "") || null,
      contacto_morada: form.contacto_morada.trim() || null,
      redes_instagram: form.redes_instagram.trim() || null,
      redes_facebook: form.redes_facebook.trim() || null,
      taxa_entrega: form.taxa_entrega ? Number(form.taxa_entrega) : null,
      cor_destaque: form.cor_destaque || null,
      cor_destaque_clara: form.cor_destaque_clara || null,
      cor_fundo: form.cor_fundo || null,
      destaque_titulo: form.destaque_titulo.trim() || null,
      destaque_descricao: form.destaque_descricao.trim() || null,
      destaque_preco: form.destaque_preco ? Number(form.destaque_preco) : null,
      destaque_video_url: videoUrl,
      emailjs_public_key: form.emailjs_public_key.trim() || null,
      emailjs_service_id: form.emailjs_service_id.trim() || null,
      emailjs_template_id: form.emailjs_template_id.trim() || null,
    };
    const { error } = await supabase.from("site_settings").update(payload).eq("id", 1);
    setStatus(error ? { text: `Erro: ${error.message}`, ok: false } : { text: "Guardado! As alterações já se aplicam à loja.", ok: true });
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-creme">Conteúdo do site</h1>
      <p className="mt-1 text-sm text-creme/50">
        Estes textos aparecem na página inicial e no rodapé de toda a loja.
      </p>

      <div className="mt-6 flex max-w-xl flex-col gap-4">
        <Section title="Textos gerais">
          <Field label="Nome da loja"><input className="input-field" value={form.nome_site} onChange={set("nome_site")} /></Field>
          <Field label="Slogan"><input className="input-field" value={form.slogan} onChange={set("slogan")} /></Field>
          <Field label="Título do hero"><input className="input-field" value={form.hero_titulo} onChange={set("hero_titulo")} /></Field>
          <Field label="Descrição do hero"><textarea className="input-field" rows={2} value={form.hero_descricao} onChange={set("hero_descricao")} /></Field>
          <Field label="Texto do rodapé"><input className="input-field" value={form.rodape_texto} onChange={set("rodape_texto")} /></Field>
        </Section>

        <Section title="Contacto">
          <Field label="Telefone"><input className="input-field" value={form.contacto_telefone} onChange={set("contacto_telefone")} /></Field>
          <Field label="Email"><input className="input-field" type="email" value={form.contacto_email} onChange={set("contacto_email")} /></Field>
          <Field label="WhatsApp (só dígitos, com indicativo)">
            <input className="input-field" placeholder="244900000000" value={form.contacto_whatsapp} onChange={set("contacto_whatsapp")} />
          </Field>
          <Field label="Morada"><input className="input-field" value={form.contacto_morada} onChange={set("contacto_morada")} /></Field>
          <Field label="Instagram (link)"><input className="input-field" value={form.redes_instagram} onChange={set("redes_instagram")} /></Field>
          <Field label="Facebook (link)"><input className="input-field" value={form.redes_facebook} onChange={set("redes_facebook")} /></Field>
        </Section>

        <Section title="Entrega">
          <Field label="Taxa de entrega (Kz)">
            <input className="input-field" type="number" min={0} value={form.taxa_entrega} onChange={set("taxa_entrega")} />
          </Field>
        </Section>

        <Section title="Cores do site">
          <Field label="Cor de destaque">
            <input type="color" className="h-10 w-full cursor-pointer rounded-lg" value={form.cor_destaque} onChange={set("cor_destaque")} />
          </Field>
          <Field label="Cor de destaque (clara)">
            <input type="color" className="h-10 w-full cursor-pointer rounded-lg" value={form.cor_destaque_clara} onChange={set("cor_destaque_clara")} />
          </Field>
          <Field label="Cor de fundo">
            <input type="color" className="h-10 w-full cursor-pointer rounded-lg" value={form.cor_fundo} onChange={set("cor_fundo")} />
          </Field>
        </Section>

        <Section title="Vídeo de destaque">
          <label className="flex h-16 cursor-pointer items-center justify-center rounded-xl border border-dashed border-creme/20 text-xs text-creme/40 hover:border-laranja/50">
            {videoUploading ? "A enviar…" : videoUrl ? "Vídeo carregado — toque para trocar" : "Toque para escolher um vídeo"}
            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={videoUploading} />
          </label>
          <Field label="Nome do produto"><input className="input-field" value={form.destaque_titulo} onChange={set("destaque_titulo")} /></Field>
          <Field label="Descrição"><textarea className="input-field" rows={2} value={form.destaque_descricao} onChange={set("destaque_descricao")} /></Field>
          <Field label="Preço (Kz)"><input className="input-field" type="number" min={0} value={form.destaque_preco} onChange={set("destaque_preco")} /></Field>
        </Section>

        <Section title="Notificações por e-mail (EmailJS)">
          <p className="text-xs text-creme/50">
            Sempre que entra uma encomenda nova, é enviado um e-mail. Cria conta grátis em{" "}
            <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-laranja">
              emailjs.com
            </a>{" "}
            e cola aqui os 3 códigos.
          </p>
          <Field label="Public Key"><input className="input-field" value={form.emailjs_public_key} onChange={set("emailjs_public_key")} /></Field>
          <Field label="Service ID"><input className="input-field" value={form.emailjs_service_id} onChange={set("emailjs_service_id")} /></Field>
          <Field label="Template ID"><input className="input-field" value={form.emailjs_template_id} onChange={set("emailjs_template_id")} /></Field>
        </Section>

        <button onClick={handleSave} className="rounded-full bg-laranja py-3 text-sm font-semibold text-preto">
          Guardar alterações
        </button>
        {status && (
          <p className={`text-center text-xs ${status.ok ? "text-green-400" : "text-red-400"}`}>{status.text}</p>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-cacau/70 bg-cacau-dark p-5">
      <h3 className="mb-4 font-display text-base text-creme">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-creme/60">{label}</label>
      {children}
    </div>
  );
}

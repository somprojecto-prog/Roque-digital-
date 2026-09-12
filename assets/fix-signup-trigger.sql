-- ============================================================
-- ROQUE DIGITAL — Correção do registo (signup)
-- Corre isto no Supabase → SQL Editor → New query → Run
--
-- PORQUÊ ISTO É PRECISO:
-- Quando alguém se regista, se a confirmação por email estiver ativa,
-- a conta ainda não tem sessão iniciada nesse instante. Sem sessão,
-- a política de segurança "auth.uid() = id" bloqueia a criação do
-- perfil feita pelo próprio site (o pedido chega sem autenticação).
-- A solução correta é criar o perfil automaticamente no servidor,
-- através de um trigger que corre sempre que uma conta nova é criada
-- em auth.users — isto não depende de sessão nem do site.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'gestor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Depois de correres isto:
-- 1. Vai a Authentication → Settings e confirma se "Confirm email"
--    está ligado ou desligado (ambos passam a funcionar com este trigger,
--    mas se estiver ligado, o utilizador só consegue entrar no painel
--    depois de clicar no link de confirmação recebido por email).
-- 2. Testa o registo novamente em manager/signup.html
-- ============================================================

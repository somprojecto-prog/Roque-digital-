import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
import type { StoredProduct } from "@/lib/cart-favorites";

export interface PendingAction {
  type: "add-to-cart" | "toggle-fav";
  product: StoredProduct;
}

const PENDING_KEY = "rd_pending_action";

export function setPendingAction(action: PendingAction) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(action));
  } catch {
    // localStorage/sessionStorage pode estar bloqueado — falha em silêncio,
    // tal como no site original.
  }
}

export function consumePendingAction(): PendingAction | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Réplica de RD.requireAccount: chamar antes de qualquer ação que exija
 * conta (carrinho, favoritos, avaliações). Sem sessão, guarda a ação
 * pendente e manda para /conta, que a repete sozinha ao voltar.
 */
export async function requireAccount(action?: PendingAction): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return true;

  if (action) setPendingAction(action);
  showToast(
    action?.type === "toggle-fav"
      ? "Precisas de criar conta (ou entrar) para guardar favoritos"
      : "Precisas de criar conta (ou entrar) para adicionar ao carrinho",
    1800
  );
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  setTimeout(() => {
    window.location.href = `/conta?next=${next}`;
  }, 1400);
  return false;
}

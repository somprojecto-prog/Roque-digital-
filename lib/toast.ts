export function showToast(message: string, duration = 2200) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("rd-toast", { detail: { message, duration } }));
}

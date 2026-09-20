import type { SVGProps } from "react";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M14 9h2.5V6H14c-1.93 0-3.5 1.57-3.5 3.5V11H8v3h2.5v6h3v-6H16l.5-3h-3V9.6c0-.33.27-.6.6-.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M15 3v10.7a2.7 2.7 0 1 1-2.2-2.66V8.4a5.4 5.4 0 1 0 4.6 5.34V9.2c1 .66 2.2 1.05 3.6 1.05V7.6c-2.2 0-4-1.7-4-3.6H15Z"
        stroke="currentColor"
        strokeWidth="0.3"
        fill="currentColor"
      />
    </svg>
  );
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 3a9 9 0 0 0-7.75 13.55L3 21l4.6-1.2A9 9 0 1 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8.5 8.7c.15-.5.6-.7 1-.7.2 0 .5 0 .7.5.2.5.6 1.5.6 1.6 0 .1.1.3 0 .4-.1.2-.2.3-.4.5-.2.2-.4.4-.2.7.2.4 1 1.5 2.1 2.2 1.4 1 1.7.9 2 .8.2-.1.9-.9 1.1-1.2.2-.3.4-.2.6-.1.2.1 1.5.7 1.7.8.2.1.4.2.4.3 0 .3-.1 1-.5 1.4-.4.4-1.4 1-2.6.7-1.5-.4-3.6-1.5-5-3.3-1-1.3-1.6-2.6-1.8-3.3-.1-.5-.2-1 .1-1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

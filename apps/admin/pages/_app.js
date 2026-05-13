import { SupabaseProvider } from "shared/lib/SupabaseContext";

export default function App({ Component, pageProps }) {
  return (
    <SupabaseProvider>
      <Component {...pageProps} />
    </SupabaseProvider>
  );
}

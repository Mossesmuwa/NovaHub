import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabase } from "shared/lib/SupabaseContext";

export default function AdminGuardLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useSupabase();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/account/login");
    }
  }, [user, loading]);

  if (loading || !user) {
    return <div style={{ padding: 40 }}>Loading admin...</div>;
  }

  return children;
}

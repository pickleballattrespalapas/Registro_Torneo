import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default function AdminLoginPage({ searchParams }: { searchParams: { error?: string } }) {
  if (isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin Login</h1>
      {searchParams.error ? <p style={{ color: "red" }}>{searchParams.error}</p> : null}
      <form method="POST" action="/api/admin/login" style={{ display: "grid", gap: 8, maxWidth: 280 }}>
        <input type="password" name="password" placeholder="Admin password" required />
        <button type="submit">Login</button>
      </form>
    </main>
  );
}

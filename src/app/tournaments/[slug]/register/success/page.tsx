import Link from "next/link";

export default function RegisterSuccessPage({ searchParams }: { searchParams: { email?: string } }) {
  return (
    <main style={{ padding: 24 }}>
      <h1>Registration received</h1>
      <p>Your spot is reserved with payment status: unpaid (Pay at desk / Invoice later).</p>
      {searchParams.email ? (
        <p style={{ color: "#b26a00" }}>
          Registration was saved, but confirmation email could not be sent because SMTP is not configured.
        </p>
      ) : null}
      <Link href="/">Return home</Link>
    </main>
  );
}

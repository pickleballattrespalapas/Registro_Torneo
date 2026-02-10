import { Registration } from "@prisma/client";

export type RegistrationRow = Registration & {
  division: { id: string; name: string };
  player: { name: string; email: string; phone: string | null; skillLevel: string } | null;
  team: {
    player1: { name: string; email: string; phone: string | null; skillLevel: string };
    player2: { name: string; email: string; phone: string | null; skillLevel: string };
  } | null;
};

function esc(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function toCsv(rows: RegistrationRow[], includeDivisionColumn: boolean) {
  const header = [
    ...(includeDivisionColumn ? ["division_id", "division_name"] : ["division_name"]),
    "player1_name",
    "player1_email",
    "player1_phone",
    "player1_skill",
    "player2_name",
    "player2_email",
    "player2_phone",
    "player2_skill",
    "timestamp",
  ];

  const lines = rows.map((r) => {
    const p1 = r.player || r.team?.player1;
    const p2 = r.team?.player2;
    const cols = [
      ...(includeDivisionColumn ? [r.division.id, r.division.name] : [r.division.name]),
      p1?.name || "",
      p1?.email || "",
      p1?.phone || "",
      p1?.skillLevel || "",
      p2?.name || "",
      p2?.email || "",
      p2?.phone || "",
      p2?.skillLevel || "",
      r.createdAt.toISOString(),
    ];

    return cols.map((c) => esc(String(c))).join(",");
  });

  return [header.map(esc).join(","), ...lines].join("\n");
}

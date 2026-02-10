import net from "net";
import tls from "tls";

function getEnv() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, ADMIN_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL || !ADMIN_EMAIL) {
    return null;
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    user: SMTP_USER,
    pass: SMTP_PASS,
    from: FROM_EMAIL,
    adminEmail: ADMIN_EMAIL,
  };
}

function base64(input: string) {
  return Buffer.from(input).toString("base64");
}

function readResponse(socket: net.Socket | tls.TLSSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    const onData = (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      if (/^\d{3} /.test(text)) {
        socket.off("data", onData);
        resolve(text);
      }
    };
    socket.on("data", onData);
    socket.once("error", reject);
  });
}

async function writeAndExpect(socket: net.Socket | tls.TLSSocket, command: string, expectedCode: string) {
  socket.write(`${command}\r\n`);
  const response = await readResponse(socket);
  if (!response.startsWith(expectedCode)) {
    throw new Error(`SMTP error: ${response.trim()}`);
  }
}

export async function sendRegistrationEmail(input: {
  subject: string;
  body: string;
  recipients: string[];
}) {
  const env = getEnv();
  if (!env) {
    return { sent: false, reason: "SMTP env vars missing" };
  }

  const socket = env.port === 465
    ? tls.connect(env.port, env.host)
    : net.connect(env.port, env.host);

  await new Promise<void>((resolve, reject) => {
    socket.once("connect", () => resolve());
    socket.once("error", reject);
  });

  try {
    await readResponse(socket);
    await writeAndExpect(socket, `EHLO localhost`, "250");

    await writeAndExpect(socket, "AUTH LOGIN", "334");
    await writeAndExpect(socket, base64(env.user), "334");
    await writeAndExpect(socket, base64(env.pass), "235");

    const allRecipients = [...new Set([...input.recipients, env.adminEmail])];
    await writeAndExpect(socket, `MAIL FROM:<${env.from}>`, "250");
    for (const recipient of allRecipients) {
      await writeAndExpect(socket, `RCPT TO:<${recipient}>`, "250");
    }

    await writeAndExpect(socket, "DATA", "354");
    const payload = [
      `From: ${env.from}`,
      `To: ${allRecipients.join(",")}`,
      `Subject: ${input.subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      input.body,
      ".",
    ].join("\r\n");
    await writeAndExpect(socket, payload, "250");
    await writeAndExpect(socket, "QUIT", "221");

    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error instanceof Error ? error.message : "Unknown error" };
  } finally {
    socket.end();
  }
}

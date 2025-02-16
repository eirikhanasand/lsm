import { FastifyReply, FastifyRequest } from "fastify";
import run from "../db.js";

type OSVHandlerParams = {
  name: string;
  version: string;
  ecosystem: string;
};

export default async function osvHandler(req: FastifyRequest, res: FastifyReply) {
  const { name, ecosystem } = req.params as OSVHandlerParams;

  if (!name || !ecosystem) {
    return res.status(400).send({ error: "Missing name or ecosystem." });
  }

  try {
    console.log(`Fetching vulnerabilities: name=${name}, ecosystem=${ecosystem} (ignoring version)`);

    const result = await run(
      `
      SELECT * FROM vulnerabilities
      WHERE package_name LIKE $1
      AND ecosystem = $2
    `,
      [`%${name}%`, ecosystem]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({});
    }

    const vulnerabilities = result.rows
      .map(row => row.data)
      .filter(vuln => vuln != null && typeof vuln === "object");

    return res.send(vulnerabilities);
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

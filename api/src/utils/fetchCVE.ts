import run from "../db.js"
import { loadSQL } from "./loadSQL.js"
import { FastifyReply } from "fastify"

export async function fetchCVEs(cve: string, res?: FastifyReply) {
    try {
        const query = await loadSQL("get_cve.sql");

        const result = await run(query, [cve]);

        if (result.rows.length === 0) {
            if (res) {
                return res.status(404).send({ error: "CVE entry not found." });
            } else {
                return [];
            }
        }
        const cveData = result.rows[0];

        return res ? res.send(cveData) : cveData;
    } catch (error) {
        console.error("Error fetching CVE data:", error);
        if (res) {
            return res.status(500).send({ error: "Internal Server Error" });
        } else {
            throw new Error("Error fetching CVE data");
        }
    }
}

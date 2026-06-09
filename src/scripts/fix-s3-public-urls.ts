import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import pg from "pg"
import { rewriteS3PublicUrl } from "../utils/s3-public-url"

export default async function fixS3PublicUrls({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.")
  }

  const client = new pg.Client({ connectionString: databaseUrl })

  await client.connect()

  try {
    const { rows } = await client.query<{ id: string; url: string }>(
      "SELECT id, url FROM image"
    )

    let updated = 0

    for (const row of rows) {
      const nextUrl = rewriteS3PublicUrl(row.url)

      if (nextUrl === row.url) {
        continue
      }

      await client.query("UPDATE image SET url = $1, updated_at = NOW() WHERE id = $2", [
        nextUrl,
        row.id,
      ])

      updated += 1
      logger.info(`Updated image ${row.id}`)
    }

    logger.info(
      updated > 0
        ? `Rewrote ${updated} image URL(s) to OVH virtual-hosted style.`
        : "No image URLs needed rewriting."
    )
  } finally {
    await client.end()
  }
}

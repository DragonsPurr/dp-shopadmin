import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  deleteSalesChannelsWorkflow,
  deleteStoresWorkflow,
} from "@medusajs/medusa/core-flows"

const ORPHAN_STORE_NAME = "Default Store"
const ORPHAN_CHANNEL_NAME = "Default Sales Channel"

export default async function cleanupOrphanDefaultStores({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const storeService = container.resolve(Modules.STORE)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)

  const stores = await storeService.listStores()
  const orphanStores = stores.filter((store) => store.name === ORPHAN_STORE_NAME)

  if (!orphanStores.length) {
    logger.info("No orphan Default Store entries found.")
    return
  }

  logger.info(
    `Removing ${orphanStores.length} orphan store(s) created by failed migration seeding...`
  )

  await deleteStoresWorkflow(container).run({
    input: {
      ids: orphanStores.map((store) => store.id),
    },
  })

  const orphanChannels = await salesChannelService.listSalesChannels({
    name: ORPHAN_CHANNEL_NAME,
  })

  if (!orphanChannels.length) {
    logger.info("No orphan Default Sales Channel entries found.")
    return
  }

  logger.info(
    `Removing ${orphanChannels.length} orphan Default Sales Channel entr${
      orphanChannels.length === 1 ? "y" : "ies"
    }...`
  )

  await deleteSalesChannelsWorkflow(container).run({
    input: {
      ids: orphanChannels.map((channel) => channel.id),
    },
  })

  logger.info("Cleanup complete.")
}

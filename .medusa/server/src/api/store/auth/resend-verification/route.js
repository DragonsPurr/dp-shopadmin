"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const email_verification_1 = require("../../../../lib/email-verification");
async function POST(req, res) {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "A valid email is required");
    }
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const authModule = req.scope.resolve(utils_1.Modules.AUTH);
    const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "email", "first_name", "has_account"],
        filters: { email },
    });
    const customer = customers?.[0];
    if (!customer?.has_account) {
        return res.status(201).json({ success: true });
    }
    const [providerIdentity] = await authModule.listProviderIdentities({ entity_id: email, provider: "emailpass" }, { select: ["provider_metadata"] });
    if (providerIdentity?.provider_metadata?.email_verified === true) {
        return res.status(201).json({ success: true });
    }
    await (0, email_verification_1.sendAccountVerificationEmail)(req.scope, {
        email: customer.email,
        firstName: customer.first_name,
    });
    res.status(201).json({ success: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2F1dGgvcmVzZW5kLXZlcmlmaWNhdGlvbi9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVlBLG9CQStDQztBQTFERCxxREFJa0M7QUFDbEMsMkVBQWlGO0FBTTFFLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQThCLENBQUE7SUFFcEQsSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUN4QyxNQUFNLElBQUksbUJBQVcsQ0FDbkIsbUJBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUM5QiwyQkFBMkIsQ0FDNUIsQ0FBQTtJQUNILENBQUM7SUFFRCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoRSxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsSUFBSSxDQU9oRCxDQUFBO0lBRUQsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDNUMsTUFBTSxFQUFFLFVBQVU7UUFDbEIsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsYUFBYSxDQUFDO1FBQ3BELE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRTtLQUNuQixDQUFDLENBQUE7SUFFRixNQUFNLFFBQVEsR0FBRyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUUvQixJQUFJLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQzNCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUNoRCxDQUFDO0lBRUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsTUFBTSxVQUFVLENBQUMsc0JBQXNCLENBQ2hFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEVBQzNDLEVBQUUsTUFBTSxFQUFFLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUNsQyxDQUFBO0lBRUQsSUFBSSxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFBRSxjQUFjLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDakUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQ2hELENBQUM7SUFFRCxNQUFNLElBQUEsaURBQTRCLEVBQUMsR0FBRyxDQUFDLEtBQUssRUFBRTtRQUM1QyxLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQWU7UUFDL0IsU0FBUyxFQUFFLFFBQVEsQ0FBQyxVQUFVO0tBQy9CLENBQUMsQ0FBQTtJQUVGLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7QUFDekMsQ0FBQyJ9
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorefrontUrl = getStorefrontUrl;
exports.buildVerificationUrl = buildVerificationUrl;
exports.generateEmailVerificationToken = generateEmailVerificationToken;
exports.markEmailUnverified = markEmailUnverified;
exports.markEmailVerified = markEmailVerified;
exports.sendAccountVerificationEmail = sendAccountVerificationEmail;
const utils_1 = require("@medusajs/framework/utils");
const CUSTOMER_ACTOR = "customer";
const EMAILPASS_PROVIDER = "emailpass";
const VERIFICATION_TOKEN_EXPIRY = "24h";
function getStorefrontUrl() {
    return (process.env.STOREFRONT_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        "http://localhost:8000");
}
function buildVerificationUrl(token, countryCode = "us") {
    const base = getStorefrontUrl().replace(/\/$/, "");
    return `${base}/${countryCode}/account/verify?token=${encodeURIComponent(token)}`;
}
function generateEmailVerificationToken(email, jwtSecret, jwtOptions) {
    return (0, utils_1.generateJwtToken)({
        entity_id: email,
        provider: EMAILPASS_PROVIDER,
        actor_type: CUSTOMER_ACTOR,
    }, {
        secret: jwtSecret,
        expiresIn: VERIFICATION_TOKEN_EXPIRY,
        jwtOptions,
    });
}
async function markEmailUnverified(container, email) {
    const authModule = container.resolve(utils_1.Modules.AUTH);
    const [providerIdentity] = await authModule.listProviderIdentities({ entity_id: email, provider: EMAILPASS_PROVIDER }, { select: ["id", "provider_metadata"] });
    if (!providerIdentity) {
        return;
    }
    await authModule.updateProviderIdentities({
        id: providerIdentity.id,
        provider_metadata: {
            ...(providerIdentity.provider_metadata ?? {}),
            email_verified: false,
        },
    });
}
async function markEmailVerified(container, email) {
    const authModule = container.resolve(utils_1.Modules.AUTH);
    const [providerIdentity] = await authModule.listProviderIdentities({ entity_id: email, provider: EMAILPASS_PROVIDER }, { select: ["id", "provider_metadata"] });
    if (!providerIdentity) {
        return;
    }
    await authModule.updateProviderIdentities({
        id: providerIdentity.id,
        provider_metadata: {
            ...(providerIdentity.provider_metadata ?? {}),
            email_verified: true,
        },
    });
}
async function sendAccountVerificationEmail(container, input) {
    const config = container.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
    const notificationModule = container.resolve(utils_1.Modules.NOTIFICATION);
    const { http } = config.projectConfig;
    const token = generateEmailVerificationToken(input.email, http.jwtSecret, http.jwtOptions);
    await markEmailUnverified(container, input.email);
    const locale = process.env.MAILGUN_DEFAULT_LOCALE || "en";
    const countryCode = input.countryCode || "us";
    await notificationModule.createNotifications([
        {
            to: input.email,
            channel: "email",
            template: "account-verification",
            data: {
                locale,
                first_name: input.firstName ?? undefined,
                verification_url: buildVerificationUrl(token, countryCode),
            },
        },
    ]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1haWwtdmVyaWZpY2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9lbWFpbC12ZXJpZmljYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFVQSw0Q0FNQztBQUVELG9EQUdDO0FBRUQsd0VBaUJDO0FBRUQsa0RBOEJDO0FBRUQsOENBOEJDO0FBRUQsb0VBbURDO0FBN0pELHFEQUlrQztBQUVsQyxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUE7QUFDakMsTUFBTSxrQkFBa0IsR0FBRyxXQUFXLENBQUE7QUFDdEMsTUFBTSx5QkFBeUIsR0FBRyxLQUFLLENBQUE7QUFFdkMsU0FBZ0IsZ0JBQWdCO0lBQzlCLE9BQU8sQ0FDTCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWM7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0I7UUFDaEMsdUJBQXVCLENBQ3hCLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBZ0Isb0JBQW9CLENBQUMsS0FBYSxFQUFFLFdBQVcsR0FBRyxJQUFJO0lBQ3BFLE1BQU0sSUFBSSxHQUFHLGdCQUFnQixFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNsRCxPQUFPLEdBQUcsSUFBSSxJQUFJLFdBQVcseUJBQXlCLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUE7QUFDbkYsQ0FBQztBQUVELFNBQWdCLDhCQUE4QixDQUM1QyxLQUFhLEVBQ2IsU0FBaUIsRUFDakIsVUFBb0M7SUFFcEMsT0FBTyxJQUFBLHdCQUFnQixFQUNyQjtRQUNFLFNBQVMsRUFBRSxLQUFLO1FBQ2hCLFFBQVEsRUFBRSxrQkFBa0I7UUFDNUIsVUFBVSxFQUFFLGNBQWM7S0FDM0IsRUFDRDtRQUNFLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFNBQVMsRUFBRSx5QkFBeUI7UUFDcEMsVUFBVTtLQUNYLENBQ0YsQ0FBQTtBQUNILENBQUM7QUFFTSxLQUFLLFVBQVUs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
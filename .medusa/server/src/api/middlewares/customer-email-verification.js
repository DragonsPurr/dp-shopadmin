"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerEmailVerificationLogin = customerEmailVerificationLogin;
const utils_1 = require("@medusajs/framework/utils");
/**
 * Intercepts customer email/password login and blocks unverified accounts.
 * Handles the response directly so the default auth route is not invoked.
 */
async function customerEmailVerificationLogin(req, res, next) {
    const { actor_type, auth_provider } = req.params;
    if (req.method !== "POST" ||
        actor_type !== "customer" ||
        auth_provider !== "emailpass") {
        return next();
    }
    const config = req.scope.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
    const authService = req.scope.resolve(utils_1.Modules.AUTH);
    const authData = {
        actor_type,
        url: req.url,
        headers: req.headers,
        query: req.query,
        body: req.body,
        protocol: req.protocol,
    };
    const { success, error, authIdentity, location, mfa_challenge } = await authService.authenticate(auth_provider, authData);
    if (location) {
        return res.status(200).json({ location });
    }
    if (success && mfa_challenge) {
        return res.status(200).json({
            mfa_required: true,
            mfa_challenge,
        });
    }
    if (!success || !authIdentity) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, error || "Authentication failed");
    }
    const providerIdentity = authIdentity.provider_identities?.find((identity) => identity.provider === auth_provider);
    if (providerIdentity?.provider_metadata?.email_verified === false) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, "Please verify your email address before signing in.");
    }
    const { http } = config.projectConfig;
    const entityIdKey = `${actor_type}_id`;
    const entityId = authIdentity.app_metadata?.[entityIdKey];
    const token = (0, utils_1.generateJwtToken)({
        actor_id: entityId ?? "",
        actor_type,
        auth_identity_id: authIdentity.id,
        auth_provider,
        app_metadata: {
            ...(authIdentity.app_metadata ?? {}),
            [entityIdKey]: entityId,
        },
        user_metadata: providerIdentity?.user_metadata ?? {},
    }, {
        secret: http.jwtSecret,
        expiresIn: http.jwtExpiresIn,
        jwtOptions: http.jwtOptions,
    });
    return res.status(200).json({ token });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tZXItZW1haWwtdmVyaWZpY2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2FwaS9taWRkbGV3YXJlcy9jdXN0b21lci1lbWFpbC12ZXJpZmljYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFnQkEsd0VBaUhDO0FBNUhELHFEQUtrQztBQUVsQzs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsOEJBQThCLENBQ2xELEdBQWtCLEVBQ2xCLEdBQW1CLEVBQ25CLElBQXdCO0lBRXhCLE1BQU0sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BR3pDLENBQUE7SUFFRCxJQUNFLEdBQUcsQ0FBQyxNQUFNLEtBQUssTUFBTTtRQUNyQixVQUFVLEtBQUssVUFBVTtRQUN6QixhQUFhLEtBQUssV0FBVyxFQUM3QixDQUFDO1FBQ0QsT0FBTyxJQUFJLEVBQUUsQ0FBQTtJQUNmLENBQUM7SUFFRCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBUXZFLENBQUE7SUFDRCxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsSUFBSSxDQW1CakQsQ0FBQTtJQUVELE1BQU0sUUFBUSxHQUFHO1FBQ2YsVUFBVTtRQUNWLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRztRQUNaLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztRQUNwQixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7UUFDaEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1FBQ2QsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO0tBQ3ZCLENBQUE7SUFFRCxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxHQUM3RCxNQUFNLFdBQVcsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBRXpELElBQUksUUFBUSxFQUFFLENBQUM7UUFDYixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQTtJQUMzQyxDQUFDO0lBRUQsSUFBSSxPQUFPLElBQUksYUFBYSxFQUFFLENBQUM7UUFDN0IsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMxQixZQUFZLEVBQUUsSUFBSTtZQUNsQixhQUFhO1NBQ2QsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUM5QixNQUFNLElBQUksbUJBQVcsQ0FDbkIsbUJBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUM5QixLQUFLLElBQUksdUJBQXVCLENBQ2pDLENBQUE7SUFDSCxDQUFDO0lBRUQsTUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUM3RCxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsS0FBSyxhQUFhLENBQ2xELENBQUE7SUFFRCxJQUFJLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLGNBQWMsS0FBSyxLQUFLLEVBQUUsQ0FBQztRQUNsRSxNQUFNLElBQUksbUJBQVcsQ0FDbkIsbUJBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUM5QixxREFBcUQsQ0FDdEQsQ0FBQTtJQUNILENBQUM7SUFFRCxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQTtJQUNyQyxNQUFNLFdBQVcsR0FBRyxHQUFHLFVBQVUsS0FBSyxDQUFBO0lBQ3RDLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUV6RCxNQUFNLEtBQUssR0FBRyxJQUFBLHdCQUFnQixFQUM1QjtRQUNFLFFBQVEsRUFBRyxRQUFtQixJQUFJLEVBQUU7UUFDcEMsVUFBVTtRQUNWLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxFQUFFO1FBQ2pDLGFBQWE7UUFDYixZQUFZLEVBQUU7WUFDWixHQUFHLENBQUMsWUFBWSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7WUFDcEMsQ0FBQyxXQUFXLENBQUMsRUFBRSxRQUFRO1NBQ3hCO1FBQ0QsYUFBYSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsSUFBSSxFQUFFO0tBQ3JELEVBQ0Q7UUFDRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVM7UUFDdEIsU0FBUyxFQUFFLElBQUksQ0FBQyxZQUFZO1FBQzVCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtLQUM1QixDQUNGLENBQUE7SUFFRCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtBQUN4QyxDQUFDIn0=
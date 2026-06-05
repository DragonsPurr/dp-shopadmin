"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const http_1 = require("@medusajs/framework/http");
const utils_1 = require("@medusajs/framework/utils");
const email_verification_1 = require("../../../../lib/email-verification");
async function POST(req, res) {
    const config = req.scope.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
    const { http } = config.projectConfig;
    const token = (0, http_1.getAuthContextFromJwtToken)(req.headers.authorization, http.jwtSecret, ["bearer"], ["customer"], http.jwtPublicKey, http.jwtVerifyOptions ?? http.jwtOptions);
    if (!token) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, "Invalid or expired verification token");
    }
    const email = token.entity_id ?? token.actor_id;
    if (!email) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, "Invalid or expired verification token");
    }
    await (0, email_verification_1.markEmailVerified)(req.scope, email);
    res.json({ success: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2F1dGgvdmVyaWZ5LWVtYWlsL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBUUEsb0JBMENDO0FBakRELG1EQUFxRTtBQUNyRSxxREFHa0M7QUFDbEMsMkVBQXNFO0FBRS9ELEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBU3ZFLENBQUE7SUFDRCxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQTtJQUVyQyxNQUFNLEtBQUssR0FBRyxJQUFBLGlDQUEwQixFQUN0QyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFDekIsSUFBSSxDQUFDLFNBQVMsRUFDZCxDQUFDLFFBQVEsQ0FBQyxFQUNWLENBQUMsVUFBVSxDQUFDLEVBQ1osSUFBSSxDQUFDLFlBQVksRUFDakIsSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxVQUFVLENBQ3pDLENBQUE7SUFFRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWCxNQUFNLElBQUksbUJBQVcsQ0FDbkIsbUJBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUM5Qix1Q0FBdUMsQ0FDeEMsQ0FBQTtJQUNILENBQUM7SUFFRCxNQUFNLEtBQUssR0FDUixLQUFnQyxDQUFDLFNBQVMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFBO0lBRS9ELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNYLE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQzlCLHVDQUF1QyxDQUN4QyxDQUFBO0lBQ0gsQ0FBQztJQUVELE1BQU0sSUFBQSxzQ0FBaUIsRUFBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBRXpDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUM3QixDQUFDIn0=
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createUser;
const utils_1 = require("@medusajs/framework/utils");
const readline = __importStar(require("readline/promises"));
const process_1 = require("process");
async function prompt(label) {
    const rl = readline.createInterface({ input: process_1.stdin, output: process_1.stdout });
    try {
        return (await rl.question(label)).trim();
    }
    finally {
        rl.close();
    }
}
async function createUser({ container }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const authService = container.resolve(utils_1.Modules.AUTH);
    const workflowService = container.resolve(utils_1.Modules.WORKFLOW_ENGINE);
    const email = process.env.ADMIN_EMAIL?.trim() || (await prompt("Email: "));
    const password = process.env.ADMIN_PASSWORD?.trim() || (await prompt("Password: "));
    if (!email || !password) {
        throw new Error("Email and password are required.");
    }
    const provider = "emailpass";
    let userRoles = [];
    if (utils_1.FeatureFlag.isFeatureEnabled("rbac")) {
        const rbacService = container.resolve(utils_1.Modules.RBAC);
        const superAdminRoles = await rbacService.listRbacRoles({
            id: "role_super_admin",
        });
        if (superAdminRoles.length > 0) {
            userRoles = [superAdminRoles[0].id];
            logger.info("Assigning super admin role to user.");
        }
    }
    const { result: users } = await workflowService.run("create-users-workflow", {
        input: {
            users: [
                {
                    email,
                    roles: userRoles,
                },
            ],
        },
    });
    const user = users[0];
    const { authIdentity, error } = await authService.register(provider, {
        body: {
            email,
            password,
        },
    });
    if (error || !authIdentity) {
        throw new Error(typeof error === "string" ? error : "Failed to register user credentials.");
    }
    await authService.updateAuthIdentities({
        id: authIdentity.id,
        app_metadata: {
            user_id: user.id,
        },
    });
    logger.info(`User created successfully: ${email}` +
        (userRoles.length > 0 ? " (super admin role assigned)" : ""));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXVzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jcmVhdGUtdXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQSw2QkFpRUM7QUFsRkQscURBSWtDO0FBQ2xDLDREQUE2QztBQUM3QyxxQ0FBMEQ7QUFFMUQsS0FBSyxVQUFVLE1BQU0sQ0FBQyxLQUFhO0lBQ2pDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsRUFBRSxLQUFLLEVBQUwsZUFBSyxFQUFFLE1BQU0sRUFBTixnQkFBTSxFQUFFLENBQUMsQ0FBQTtJQUN0RCxJQUFJLENBQUM7UUFDSCxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDMUMsQ0FBQztZQUFTLENBQUM7UUFDVCxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUE7SUFDWixDQUFDO0FBQ0gsQ0FBQztBQUVjLEtBQUssVUFBVSxVQUFVLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDOUQsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNsRSxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNuRCxNQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUVsRSxNQUFNLEtBQUssR0FDVCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7SUFDOUQsTUFBTSxRQUFRLEdBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFBO0lBRXBFLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUE7SUFDckQsQ0FBQztJQUVELE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQTtJQUM1QixJQUFJLFNBQVMsR0FBYSxFQUFFLENBQUE7SUFFNUIsSUFBSSxtQkFBVyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDekMsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDbkQsTUFBTSxlQUFlLEdBQUcsTUFBTSxXQUFXLENBQUMsYUFBYSxDQUFDO1lBQ3RELEVBQUUsRUFBRSxrQkFBa0I7U0FDdkIsQ0FBQyxDQUFBO1FBRUYsSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQy9CLFNBQVMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUE7UUFDcEQsQ0FBQztJQUNILENBQUM7SUFFRCxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0sZUFBZSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRTtRQUMzRSxLQUFLLEVBQUU7WUFDTCxLQUFLLEVBQUU7Z0JBQ0w7b0JBQ0UsS0FBSztvQkFDTCxLQUFLLEVBQUUsU0FBUztpQkFDakI7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFBO0lBRUYsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3JCLE1BQU0sRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRTtRQUNuRSxJQUFJLEVBQUU7WUFDSixLQUFLO1lBQ0wsUUFBUTtTQUNUO0tBQ0YsQ0FBQyxDQUFBO0lBRUYsSUFBSSxLQUFLLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUMzQixNQUFNLElBQUksS0FBSyxDQUNiLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxzQ0FBc0MsQ0FDM0UsQ0FBQTtJQUNILENBQUM7SUFFRCxNQUFNLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQztRQUNyQyxFQUFFLEVBQUUsWUFBWSxDQUFDLEVBQUU7UUFDbkIsWUFBWSxFQUFFO1lBQ1osT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFO1NBQ2pCO0tBQ0YsQ0FBQyxDQUFBO0lBRUYsTUFBTSxDQUFDLElBQUksQ0FDVCw4QkFBOEIsS0FBSyxFQUFFO1FBQ25DLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FDL0QsQ0FBQTtBQUNILENBQUMifQ==
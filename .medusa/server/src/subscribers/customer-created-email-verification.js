"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = customerCreatedEmailVerificationHandler;
const utils_1 = require("@medusajs/framework/utils");
const email_verification_1 = require("../lib/email-verification");
async function customerCreatedEmailVerificationHandler({ event: { data }, container, }) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "email", "first_name", "has_account"],
        filters: { id: data.id },
    });
    const customer = customers?.[0];
    if (!customer?.email || !customer.has_account) {
        return;
    }
    await (0, email_verification_1.sendAccountVerificationEmail)(container, {
        email: customer.email,
        firstName: customer.first_name,
    });
}
exports.config = {
    event: "customer.created",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tZXItY3JlYXRlZC1lbWFpbC12ZXJpZmljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3Vic2NyaWJlcnMvY3VzdG9tZXItY3JlYXRlZC1lbWFpbC12ZXJpZmljYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBSUEsMERBc0JDO0FBekJELHFEQUFxRTtBQUNyRSxrRUFBd0U7QUFFekQsS0FBSyxVQUFVLHVDQUF1QyxDQUFDLEVBQ3BFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxFQUNmLFNBQVMsR0FDc0I7SUFDL0IsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUVoRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztRQUM1QyxNQUFNLEVBQUUsVUFBVTtRQUNsQixNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxhQUFhLENBQUM7UUFDcEQsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7S0FDekIsQ0FBQyxDQUFBO0lBRUYsTUFBTSxRQUFRLEdBQUcsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFL0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDOUMsT0FBTTtJQUNSLENBQUM7SUFFRCxNQUFNLElBQUEsaURBQTRCLEVBQUMsU0FBUyxFQUFFO1FBQzVDLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSztRQUNyQixTQUFTLEVBQUUsUUFBUSxDQUFDLFVBQVU7S0FDL0IsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQUVZLFFBQUEsTUFBTSxHQUFxQjtJQUN0QyxLQUFLLEVBQUUsa0JBQWtCO0NBQzFCLENBQUEifQ==
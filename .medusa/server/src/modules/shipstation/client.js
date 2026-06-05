"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipStationClient = void 0;
const utils_1 = require("@medusajs/framework/utils");
class ShipStationClient {
    constructor(options) {
        this.options = options;
    }
    async sendRequest(url, data) {
        return fetch(`https://api.shipstation.com/v2${url}`, {
            ...data,
            headers: {
                ...data?.headers,
                "api-key": this.options.api_key,
                "Content-Type": "application/json",
            },
        })
            .then((resp) => {
            const contentType = resp.headers.get("content-type");
            if (!contentType?.includes("application/json")) {
                return resp.text();
            }
            return resp.json();
        })
            .then((resp) => {
            if (typeof resp !== "string" && resp.errors?.length) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `An error occurred while sending a request to ShipStation: ${resp.errors.map((error) => error.message)}`);
            }
            return resp;
        });
    }
    async getCarriers() {
        return await this.sendRequest("/carriers");
    }
    async getShippingRates(data) {
        return await this.sendRequest("/rates", {
            method: "POST",
            body: JSON.stringify(data),
        }).then((resp) => {
            if (resp.rate_response.errors?.length) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `An error occurred while retrieving rates from ShipStation: ${resp.rate_response.errors.map((error) => error.message)}`);
            }
            return resp;
        });
    }
    async getShipmentRates(id) {
        return await this.sendRequest(`/shipments/${id}/rates`);
    }
    async purchaseLabelForShipment(id) {
        return await this.sendRequest(`/labels/shipment/${id}`, {
            method: "POST",
            body: JSON.stringify({}),
        });
    }
    async voidLabel(id) {
        return await this.sendRequest(`/labels/${id}/void`, {
            method: "PUT",
        });
    }
    async cancelShipment(id) {
        return await this.sendRequest(`/shipments/${id}/cancel`, {
            method: "PUT",
        });
    }
    async getShipment(id) {
        return await this.sendRequest(`/shipments/${id}`);
    }
}
exports.ShipStationClient = ShipStationClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvc2hpcHN0YXRpb24vY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUF1RDtBQVl2RCxNQUFhLGlCQUFpQjtJQUc1QixZQUFZLE9BQTJCO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0lBQ3hCLENBQUM7SUFFTyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQVcsRUFBRSxJQUFrQjtRQUN2RCxPQUFPLEtBQUssQ0FBQyxpQ0FBaUMsR0FBRyxFQUFFLEVBQUU7WUFDbkQsR0FBRyxJQUFJO1lBQ1AsT0FBTyxFQUFFO2dCQUNQLEdBQUcsSUFBSSxFQUFFLE9BQU87Z0JBQ2hCLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU87Z0JBQy9CLGNBQWMsRUFBRSxrQkFBa0I7YUFDbkM7U0FDRixDQUFDO2FBQ0MsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDYixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtZQUNwRCxJQUFJLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7Z0JBQy9DLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO1lBQ3BCLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUNwQixDQUFDLENBQUM7YUFDRCxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNiLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUM7Z0JBQ3BELE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQzlCLDZEQUE2RCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FDMUUsQ0FBQyxLQUEwQixFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUM5QyxFQUFFLENBQ0osQ0FBQTtZQUNILENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQTtRQUNiLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUVELEtBQUssQ0FBQyxXQUFXO1FBQ2YsT0FBTyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDNUMsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FDcEIsSUFBNkI7UUFFN0IsT0FBTyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFO1lBQ3RDLE1BQU0sRUFBRSxNQUFNO1lBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1NBQzNCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNmLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUM7Z0JBQ3RDLE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQzlCLDhEQUE4RCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQ3pGLENBQUMsS0FBMEIsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FDOUMsRUFBRSxDQUNKLENBQUE7WUFDSCxDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBVTtRQUMvQixPQUFPLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDekQsQ0FBQztJQUVELEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxFQUFVO1FBQ3ZDLE9BQU8sTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFLEVBQUUsRUFBRTtZQUN0RCxNQUFNLEVBQUUsTUFBTTtZQUNkLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztTQUN6QixDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFVO1FBQ3hCLE9BQU8sTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUU7WUFDbEQsTUFBTSxFQUFFLEtBQUs7U0FDZCxDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFVO1FBQzdCLE9BQU8sTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUU7WUFDdkQsTUFBTSxFQUFFLEtBQUs7U0FDZCxDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFVO1FBQzFCLE9BQU8sTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNuRCxDQUFDO0NBQ0Y7QUF4RkQsOENBd0ZDIn0=
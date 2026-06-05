"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const client_1 = require("./client");
class ShipStationProviderService extends utils_1.AbstractFulfillmentProviderService {
    constructor({}, options) {
        super();
        this.options_ = options;
        this.client = new client_1.ShipStationClient(options);
    }
    async getFulfillmentOptions() {
        const { carriers } = await this.client.getCarriers();
        const fulfillmentOptions = [];
        carriers
            .filter((carrier) => !carrier.disabled_by_billing_plan)
            .forEach((carrier) => {
            carrier.services.forEach((service) => {
                fulfillmentOptions.push({
                    id: `${carrier.carrier_id}__${service.service_code}`,
                    name: service.name,
                    carrier_id: carrier.carrier_id,
                    carrier_service_code: service.service_code,
                });
            });
        });
        return fulfillmentOptions;
    }
    async canCalculate(_data) {
        return true;
    }
    /** Medusa stores product/variant weight in grams. */
    getLineItemWeightGrams(item) {
        const perUnit = 
        // @ts-ignore variant/product may be loaded on line items
        item.variant?.weight ?? item.product?.weight ?? 0;
        const qty = item.quantity;
        const quantity = typeof qty === "number"
            ? qty
            : typeof qty === "object" && qty != null && "numeric" in qty
                ? qty.numeric
                : Number(qty ?? 1);
        return perUnit * quantity;
    }
    async createShipment({ carrier_id, carrier_service_code, from_address, to_address, items, currency_code, }) {
        if (!from_address?.address) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "from_location.address is required to calculate shipping rate");
        }
        const ship_from = {
            name: from_address?.name || "",
            phone: from_address?.address?.phone || "",
            address_line1: from_address?.address?.address_1 || "",
            city_locality: from_address?.address?.city || "",
            state_province: from_address?.address?.province || "",
            postal_code: from_address?.address?.postal_code || "",
            country_code: from_address?.address?.country_code || "",
            address_residential_indicator: "unknown",
        };
        if (!to_address) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "shipping_address is required to calculate shipping rate");
        }
        const ship_to = {
            name: `${to_address.first_name} ${to_address.last_name}`,
            phone: to_address.phone || "",
            address_line1: to_address.address_1 || "",
            city_locality: to_address.city || "",
            state_province: to_address.province || "",
            postal_code: to_address.postal_code || "",
            country_code: to_address.country_code || "",
            address_residential_indicator: "unknown",
        };
        const packageWeightGrams = items.reduce((sum, item) => {
            return sum + this.getLineItemWeightGrams(item);
        }, 0);
        if (packageWeightGrams <= 0) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Cannot calculate shipping rates: cart items have no weight. Set weight (in grams) on each product or variant in the admin.");
        }
        return await this.client.getShippingRates({
            shipment: {
                carrier_id: carrier_id,
                service_code: carrier_service_code,
                ship_to,
                ship_from,
                validate_address: "no_validation",
                items: items?.map((item) => ({
                    name: item.title,
                    quantity: item.quantity,
                    sku: item.variant_sku || "",
                })),
                packages: [
                    {
                        weight: {
                            value: packageWeightGrams,
                            unit: "gram",
                        },
                    },
                ],
                customs: {
                    contents: "merchandise",
                    non_delivery: "return_to_sender",
                },
            },
            rate_options: {
                carrier_ids: [carrier_id],
                service_codes: [carrier_service_code],
                preferred_currency: currency_code,
            },
        });
    }
    async calculatePrice(optionData, data, context) {
        const { shipment_id } = data || {};
        const { carrier_id, carrier_service_code } = optionData;
        let rate;
        if (!shipment_id) {
            const shipment = await this.createShipment({
                carrier_id,
                carrier_service_code,
                from_address: {
                    name: context.from_location?.name,
                    address: context.from_location?.address,
                },
                to_address: context.shipping_address,
                items: context.items || [],
                currency_code: context.currency_code,
            });
            rate = shipment.rate_response.rates[0];
        }
        else {
            const rateResponse = await this.client.getShipmentRates(shipment_id);
            rate = rateResponse[0].rates[0];
        }
        const calculatedPrice = !rate
            ? 0
            : rate.shipping_amount.amount +
                rate.insurance_amount.amount +
                rate.confirmation_amount.amount +
                rate.other_amount.amount +
                (rate.tax_amount?.amount || 0);
        return {
            calculated_amount: calculatedPrice,
            is_calculated_price_tax_inclusive: !!rate?.tax_amount,
        };
    }
    async validateFulfillmentData(optionData, data, context) {
        let { shipment_id } = data;
        if (!shipment_id) {
            const { carrier_id, carrier_service_code } = optionData;
            const shipment = await this.createShipment({
                carrier_id,
                carrier_service_code,
                from_address: {
                    // @ts-ignore
                    name: context.from_location?.name,
                    // @ts-ignore
                    address: context.from_location?.address,
                },
                // @ts-ignore
                to_address: context.shipping_address,
                // @ts-ignore
                items: context.items || [],
                // @ts-ignore
                currency_code: context.currency_code,
            });
            shipment_id = shipment.shipment_id;
        }
        return {
            ...data,
            shipment_id,
        };
    }
    async createFulfillment(data, items, order, fulfillment) {
        const { shipment_id } = data;
        const originalShipment = await this.client.getShipment(shipment_id);
        const orderItemsToFulfill = [];
        items.map((item) => {
            // @ts-ignore
            const orderItem = order.items.find((i) => i.id === item.line_item_id);
            if (!orderItem) {
                return;
            }
            // @ts-ignore
            orderItemsToFulfill.push({
                ...orderItem,
                // @ts-ignore
                quantity: item.quantity,
            });
        });
        const newShipment = await this.createShipment({
            carrier_id: originalShipment.carrier_id,
            carrier_service_code: originalShipment.service_code,
            from_address: {
                name: originalShipment.ship_from.name,
                address: {
                    ...originalShipment.ship_from,
                    address_1: originalShipment.ship_from.address_line1,
                    city: originalShipment.ship_from.city_locality,
                    province: originalShipment.ship_from.state_province,
                },
            },
            to_address: {
                ...originalShipment.ship_to,
                address_1: originalShipment.ship_to.address_line1,
                city: originalShipment.ship_to.city_locality,
                province: originalShipment.ship_to.state_province,
            },
            items: orderItemsToFulfill,
            // @ts-ignore
            currency_code: order.currency_code,
        });
        const label = await this.client.purchaseLabelForShipment(newShipment.shipment_id);
        return {
            data: {
                ...(fulfillment.data || {}),
                label_id: label.label_id,
                shipment_id: label.shipment_id,
            },
        };
    }
    async cancelFulfillment(data) {
        const { label_id, shipment_id } = data;
        await this.client.voidLabel(label_id);
        await this.client.cancelShipment(shipment_id);
    }
}
ShipStationProviderService.identifier = "shipstation";
exports.default = ShipStationProviderService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3NoaXBzdGF0aW9uL3NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFHa0M7QUFXbEMscUNBQTRDO0FBTzVDLE1BQU0sMEJBQTJCLFNBQVEsMENBQWtDO0lBS3pFLFlBQVksRUFBRSxFQUFFLE9BQTJCO1FBQ3pDLEtBQUssRUFBRSxDQUFBO1FBRVAsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUE7UUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLDBCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzlDLENBQUM7SUFFRCxLQUFLLENBQUMscUJBQXFCO1FBQ3pCLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDcEQsTUFBTSxrQkFBa0IsR0FBd0IsRUFBRSxDQUFBO1FBRWxELFFBQVE7YUFDTCxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDO2FBQ3RELE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ25DLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDdEIsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDLFVBQVUsS0FBSyxPQUFPLENBQUMsWUFBWSxFQUFFO29CQUNwRCxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7b0JBQ2xCLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVTtvQkFDOUIsb0JBQW9CLEVBQUUsT0FBTyxDQUFDLFlBQVk7aUJBQzNDLENBQUMsQ0FBQTtZQUNKLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUE7UUFFSixPQUFPLGtC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
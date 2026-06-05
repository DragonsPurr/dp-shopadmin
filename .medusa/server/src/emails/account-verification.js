"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountVerificationSubject = exports.getAccountVerificationTemplate = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
const getAccountVerificationTemplate = (props) => ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: "Verify your email to activate your account" }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: { fontFamily: "sans-serif", backgroundColor: "#f6f6f6" }, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: {
                    backgroundColor: "#ffffff",
                    padding: "32px",
                    borderRadius: "8px",
                    maxWidth: "480px",
                }, children: [(0, jsx_runtime_1.jsx)(components_1.Heading, { style: { fontSize: "20px", marginBottom: "16px" }, children: "Verify your email" }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: { fontSize: "14px", lineHeight: "22px" }, children: props.first_name ? `Hi ${props.first_name},` : "Hi," }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: { fontSize: "14px", lineHeight: "22px" }, children: "Thanks for creating an account. Please confirm your email address to activate your account and sign in." }), (0, jsx_runtime_1.jsx)(components_1.Button, { href: props.verification_url, style: {
                            backgroundColor: "#111111",
                            color: "#ffffff",
                            padding: "12px 20px",
                            borderRadius: "6px",
                            fontSize: "14px",
                            textDecoration: "none",
                            display: "inline-block",
                            marginTop: "8px",
                        }, children: "Verify email" }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: { fontSize: "12px", lineHeight: "20px", color: "#666666" }, children: "This link expires in 24 hours. If you did not create an account, you can ignore this email." })] }) })] }));
exports.getAccountVerificationTemplate = getAccountVerificationTemplate;
const accountVerificationSubject = (locale) => {
    switch (locale) {
        case "en":
        default:
            return "Verify your email address";
    }
};
exports.accountVerificationSubject = accountVerificationSubject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC12ZXJpZmljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZW1haWxzL2FjY291bnQtdmVyaWZpY2F0aW9uLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBRUEsd0RBU2dDO0FBT3pCLE1BQU0sOEJBQThCLEdBQUcsQ0FDNUMsS0FBb0MsRUFDcEMsRUFBRSxDQUFDLENBQ0gsd0JBQUMsaUJBQUksZUFDSCx1QkFBQyxpQkFBSSxLQUFHLEVBQ1IsdUJBQUMsb0JBQU8sNkRBQXFELEVBQzdELHVCQUFDLGlCQUFJLElBQUMsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLFlBQ25FLHdCQUFDLHNCQUFTLElBQ1IsS0FBSyxFQUFFO29CQUNMLGVBQWUsRUFBRSxTQUFTO29CQUMxQixPQUFPLEVBQUUsTUFBTTtvQkFDZixZQUFZLEVBQUUsS0FBSztvQkFDbkIsUUFBUSxFQUFFLE9BQU87aUJBQ2xCLGFBRUQsdUJBQUMsb0JBQU8sSUFBQyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsa0NBRWhELEVBQ1YsdUJBQUMsaUJBQUksSUFBQyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsWUFDbEQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FDaEQsRUFDUCx1QkFBQyxpQkFBSSxJQUFDLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSx3SEFHOUMsRUFDUCx1QkFBQyxtQkFBTSxJQUNMLElBQUksRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQzVCLEtBQUssRUFBRTs0QkFDTCxlQUFlLEVBQUUsU0FBUzs0QkFDMUIsS0FBSyxFQUFFLFNBQVM7NEJBQ2hCLE9BQU8sRUFBRSxXQUFXOzRCQUNwQixZQUFZLEVBQUUsS0FBSzs0QkFDbkIsUUFBUSxFQUFFLE1BQU07NEJBQ2hCLGNBQWMsRUFBRSxNQUFNOzRCQUN0QixPQUFPLEVBQUUsY0FBYzs0QkFDdkIsU0FBUyxFQUFFLEtBQUs7eUJBQ2pCLDZCQUdNLEVBQ1QsdUJBQUMsaUJBQUksSUFBQyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSw0R0FHaEUsSUFDRyxHQUNQLElBQ0YsQ0FDUixDQUFBO0FBL0NZLFFBQUEsOEJBQThCLGtDQStDMUM7QUFFTSxNQUFNLDBCQUEwQixHQUFHLENBQUMsTUFBYyxFQUFFLEVBQUU7SUFDM0QsUUFBUSxNQUFNLEVBQUUsQ0FBQztRQUNmLEtBQUssSUFBSSxDQUFDO1FBQ1Y7WUFDRSxPQUFPLDJCQUEyQixDQUFBO0lBQ3RDLENBQUM7QUFDSCxDQUFDLENBQUE7QUFOWSxRQUFBLDBCQUEwQiw4QkFNdEMifQ==
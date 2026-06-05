// @ts-nocheck
import * as React from "react"
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components"

export type AccountVerificationEmailProps = {
  first_name?: string
  verification_url: string
}

export const getAccountVerificationTemplate = (
  props: AccountVerificationEmailProps
) => (
  <Html>
    <Head />
    <Preview>Verify your email to activate your account</Preview>
    <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6" }}>
      <Container
        style={{
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "8px",
          maxWidth: "480px",
        }}
      >
        <Heading style={{ fontSize: "20px", marginBottom: "16px" }}>
          Verify your email
        </Heading>
        <Text style={{ fontSize: "14px", lineHeight: "22px" }}>
          {props.first_name ? `Hi ${props.first_name},` : "Hi,"}
        </Text>
        <Text style={{ fontSize: "14px", lineHeight: "22px" }}>
          Thanks for creating an account. Please confirm your email address to
          activate your account and sign in.
        </Text>
        <Button
          href={props.verification_url}
          style={{
            backgroundColor: "#111111",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "6px",
            fontSize: "14px",
            textDecoration: "none",
            display: "inline-block",
            marginTop: "8px",
          }}
        >
          Verify email
        </Button>
        <Text style={{ fontSize: "12px", lineHeight: "20px", color: "#666666" }}>
          This link expires in 24 hours. If you did not create an account, you
          can ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const accountVerificationSubject = (locale: string) => {
  switch (locale) {
    case "en":
    default:
      return "Verify your email address"
  }
}

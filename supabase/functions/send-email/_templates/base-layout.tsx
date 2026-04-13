import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import React from 'react'

interface BaseLayoutProps {
  preview: string
  children?: React.ReactNode
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>Parler Moins Vite</Text>
          </Section>

          <Section style={content}>
            {children}
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Parler Moins Vite. Tous droits réservés.
            </Text>
            <Text style={footerText}>
              <Link href="https://www.parlermoinsvite.fr" style={footerLink}>www.parlermoinsvite.fr</Link>
            </Text>
            <Text style={footerLinks}>
              Une question ? Écrivez-nous à{' '}
              <Link href="mailto:contact@parlermoinsvite.fr" style={footerLink}>contact@parlermoinsvite.fr</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default BaseLayout

// Design tokens from ParlerMoinsVite design system
// Primary: hsl(170, 45%, 41%) = #3a9e8e (soft teal)
// Foreground: hsl(230, 18%, 22%) = #2e3346
// Muted foreground: hsl(230, 10%, 48%) = #6e7282
// Background: hsl(40, 18%, 97%) = #f8f6f3 (warm cream)
// Border: hsl(36, 20%, 88%) = #e5dfd6
// Radius: 18px

const main = {
  backgroundColor: '#f8f6f3',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '580px',
  borderRadius: '18px',
  overflow: 'hidden' as const,
}

const header = {
  padding: '24px 32px',
  borderBottom: '1px solid #e5dfd6',
  textAlign: 'center' as const,
}

const logoText = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#3a9e8e',
  margin: '0',
  display: 'inline-block' as const,
  verticalAlign: 'middle' as const,
}

const content = {
  padding: '32px',
}

const footer = {
  padding: '24px 32px',
  borderTop: '1px solid #e5dfd6',
  backgroundColor: '#f8f6f3',
}

const footerText = {
  color: '#6e7282',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}

const footerLinks = {
  color: '#6e7282',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
  textAlign: 'center' as const,
}

const footerLink = {
  color: '#3a9e8e',
  textDecoration: 'underline',
}
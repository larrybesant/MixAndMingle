import type { Metadata } from "next"
import { LegalDocumentLayout } from "@/components/legal-document-layout"

export const metadata: Metadata = {
  title: "Privacy Policy | Mix & Mingle",
  description: "Privacy Policy for Mix & Mingle application",
}

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentLayout title="Privacy Policy" lastUpdated="May 21, 2025">
      <h2>1. Introduction</h2>
      <p>
        At Mix & Mingle, we respect your privacy and are committed to protecting your personal data. This Privacy Policy
        explains how we collect, use, disclose, and safeguard your information when you use our website, mobile
        application, or any of our services.
      </p>
      <p>
        Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do
        not access our services.
      </p>

      <h2>2. Information We Collect</h2>
      <p>We collect several types of information from and about users of our services, including:</p>
      <h3>2.1 Personal Data</h3>
      <p>
        Personal Data refers to information that identifies you or can be used to identify you. We may collect the
        following Personal Data:
      </p>
      <ul>
        <li>Contact information (such as name, email address, and phone number)</li>
        <li>Account credentials (such as username and password)</li>
        <li>Profile information (such as profile picture, bio, and preferences)</li>
        <li>Payment information (such as credit card details and billing address)</li>
        <li>Communication data (such as messages, comments, and feedback)</li>
      </ul>

      <h3>2.2 Usage Data</h3>
      <p>We may also collect information about how you access and use our services, including:</p>
      <ul>
        <li>Log data (such as IP address, browser type, pages visited, and time spent)</li>
        <li>Device information (such as device type, operating system, and unique device identifiers)</li>
        <li>Location data (such as general location based on IP address)</li>
        <li>Interaction data (such as features used, content viewed, and clicks)</li>
      </ul>

      <h2>3. How We Collect Information</h2>
      <p>We collect information through various methods, including:</p>
      <ul>
        <li>Direct interactions (when you register, create a profile, or communicate with us)</li>
        <li>Automated technologies (such as cookies, web beacons, and similar technologies)</li>
        <li>Third-party sources (such as social media platforms if you choose to link your accounts)</li>
      </ul>

      <h2>4. How We Use Your Information</h2>
      <p>We may use the information we collect for various purposes, including:</p>
      <ul>
        <li>Providing, maintaining, and improving our services</li>
        <li>Processing transactions and managing your account</li>
        <li>Personalizing your experience and delivering content relevant to your interests</li>
        <li>Communicating with you about updates, promotions, and events</li>
        <li>Monitoring and analyzing usage patterns and trends</li>
        <li>Protecting our services and users from fraud, abuse, and unauthorized access</li>
        <li>Complying with legal obligations</li>
      </ul>

      <h2>5. Third-Party Services</h2>
      <p>We use various third-party services to support our application. These include:</p>
      <h3>5.1 Firebase</h3>
      <p>
        We use Firebase for authentication, database storage, and analytics. Firebase collects and processes data
        according to its own privacy policy, which can be found at{" "}
        <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">
          https://firebase.google.com/support/privacy
        </a>
        .
      </p>

      <h3>5.2 Twilio</h3>
      <p>
        We use Twilio for messaging services. Twilio collects and processes data according to its own privacy policy,
        which can be found at{" "}
        <a href="https://www.twilio.com/legal/privacy" target="_blank" rel="noopener noreferrer">
          https://www.twilio.com/legal/privacy
        </a>
        .
      </p>

      <h3>5.3 Redis</h3>
      <p>
        We use Redis for caching and session management. Redis is used as an infrastructure component and does not
        independently collect user data.
      </p>

      <h2>6. Data Sharing and Disclosure</h2>
      <p>We may share your information in the following situations:</p>
      <ul>
        <li>With service providers who perform services on our behalf</li>
        <li>With business partners with your consent</li>
        <li>For legal purposes, such as complying with legal obligations or protecting our rights</li>
        <li>In connection with a business transaction, such as a merger or acquisition</li>
      </ul>

      <h2>7. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your personal data against
        unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission
        over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2>8. Your Rights</h2>
      <p>Depending on your location, you may have certain rights regarding your personal data, including:</p>
      <ul>
        <li>The right to access your personal data</li>
        <li>The right to rectify inaccurate personal data</li>
        <li>The right to erase your personal data</li>
        <li>The right to restrict processing of your personal data</li>
        <li>The right to data portability</li>
        <li>The right to object to processing of your personal data</li>
        <li>The right to withdraw consent</li>
      </ul>
      <p>To exercise these rights, please contact us using the information provided in the "Contact Us" section.</p>

      <h2>9. Children's Privacy</h2>
      <p>
        Our services are not intended for children under the age of 13. We do not knowingly collect personal data from
        children under 13. If you are a parent or guardian and believe that your child has provided us with personal
        data, please contact us immediately.
      </p>

      <h2>10. International Data Transfers</h2>
      <p>
        Your information may be transferred to and processed in countries other than the country in which you reside.
        These countries may have data protection laws that are different from the laws of your country. By using our
        services, you consent to the transfer of your information to these countries.
      </p>

      <h2>11. Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy
        Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy
        periodically for any changes.
      </p>

      <h2>12. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at{" "}
        <a href="mailto:privacy@mixandmingle.com">privacy@mixandmingle.com</a>.
      </p>
    </LegalDocumentLayout>
  )
}

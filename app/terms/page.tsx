import type { Metadata } from "next"
import { LegalDocumentLayout } from "@/components/legal-document-layout"

export const metadata: Metadata = {
  title: "Terms of Service | Mix & Mingle",
  description: "Terms of Service for Mix & Mingle application",
}

export default function TermsOfServicePage() {
  return (
    <LegalDocumentLayout title="Terms of Service" lastUpdated="May 21, 2025">
      <h2>1. Acceptance of Terms</h2>
      <p>
        Welcome to Mix & Mingle. By accessing or using our website, mobile application, or any of our services, you
        agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our
        services.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        Mix & Mingle provides a platform for users to discover, join, and host DJ events and music-related gatherings.
        Our services include but are not limited to live streaming, chat functionality, event creation, and user profile
        management.
      </p>

      <h2>3. User Accounts</h2>
      <p>
        To access certain features of our service, you must register for an account. You agree to provide accurate,
        current, and complete information during the registration process and to update such information to keep it
        accurate, current, and complete.
      </p>
      <p>
        You are responsible for safeguarding your password and for all activities that occur under your account. You
        agree to notify us immediately of any unauthorized use of your account.
      </p>

      <h2>4. User Conduct</h2>
      <p>You agree not to use the service to:</p>
      <ul>
        <li>
          Upload, post, or transmit content that is illegal, harmful, threatening, abusive, harassing, defamatory,
          vulgar, obscene, or otherwise objectionable
        </li>
        <li>
          Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity
        </li>
        <li>
          Upload or transmit any content that infringes any patent, trademark, trade secret, copyright, or other
          proprietary rights
        </li>
        <li>
          Upload or transmit any unsolicited advertising, promotional materials, "junk mail," "spam," or any other form
          of solicitation
        </li>
        <li>
          Upload or transmit any material that contains software viruses or any other computer code designed to
          interrupt, destroy, or limit the functionality of any computer software or hardware
        </li>
        <li>Interfere with or disrupt the service or servers or networks connected to the service</li>
        <li>Violate any applicable local, state, national, or international law</li>
      </ul>

      <h2>5. Intellectual Property Rights</h2>
      <p>
        The service and its original content, features, and functionality are owned by Mix & Mingle and are protected by
        international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights
        laws.
      </p>
      <p>
        You retain any and all of your rights to any content you submit, post, or display on or through the service. By
        submitting, posting, or displaying content on or through the service, you grant us a worldwide, non-exclusive,
        royalty-free license to use, reproduce, adapt, publish, translate, and distribute such content.
      </p>

      <h2>6. Third-Party Links</h2>
      <p>
        Our service may contain links to third-party websites or services that are not owned or controlled by Mix &
        Mingle. We have no control over and assume no responsibility for the content, privacy policies, or practices of
        any third-party websites or services.
      </p>

      <h2>7. Termination</h2>
      <p>
        We may terminate or suspend your account and bar access to the service immediately, without prior notice or
        liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the
        Terms.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        In no event shall Mix & Mingle, nor its directors, employees, partners, agents, suppliers, or affiliates, be
        liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation,
        loss of profits, data, use, goodwill, or other intangible losses, resulting from:
      </p>
      <ul>
        <li>Your access to or use of or inability to access or use the service</li>
        <li>Any conduct or content of any third party on the service</li>
        <li>Any content obtained from the service</li>
        <li>Unauthorized access, use, or alteration of your transmissions or content</li>
      </ul>

      <h2>9. Disclaimer</h2>
      <p>
        Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis.
        The service is provided without warranties of any kind, whether express or implied, including, but not limited
        to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of
        performance.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        These Terms shall be governed and construed in accordance with the laws of the United States, without regard to
        its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be
        considered a waiver of those rights.
      </p>

      <h2>11. Changes to Terms</h2>
      <p>
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
        material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a
        material change will be determined at our sole discretion.
      </p>

      <h2>12. Contact Us</h2>
      <p>
        If you have any questions about these Terms, please contact us at{" "}
        <a href="mailto:legal@mixandmingle.com">legal@mixandmingle.com</a>.
      </p>
    </LegalDocumentLayout>
  )
}

import { useDocumentHead } from '../../../lib/useDocumentHead.js';
import { LegalPage } from './LegalPage.jsx';

export function PrivacyPage() {
  useDocumentHead({ title: 'Privacy Policy — Stafy' });

  return (
    <LegalPage title="Privacy Policy">
      <section>
        <h2 style={sectionHeading}>What this is</h2>
        <p>
          Stafy is a practical assessment project built for AppTrait Solutions. It is not a commercial product, and this
          policy describes how the demo application handles data — not a production privacy commitment.
        </p>
      </section>
      <section>
        <h2 style={sectionHeading}>What data is collected</h2>
        <p>For anyone with a Stafy account (created by HR, not self-registered), the system holds:</p>
        <ul style={listStyle}>
          <li>Name, email address, and phone number</li>
          <li>Role, department, and reporting manager</li>
          <li>Attendance records (check-in/check-out timestamps)</li>
          <li>Leave requests, their status, and approval history</li>
        </ul>
        <p>No biometric data, location data, or payment information is collected.</p>
      </section>
      <section>
        <h2 style={sectionHeading}>Demo data</h2>
        <p>
          This is an evaluation build. The demo dataset (including the seeded demo accounts) can be reset at any time
          without notice. Do not enter real personal information into the live demo.
        </p>
      </section>
      <section>
        <h2 style={sectionHeading}>Cookies and tracking</h2>
        <p>
          Stafy sets one strictly-necessary, <code>HttpOnly</code> session cookie used only to keep you signed in. It sets
          no tracking or advertising cookies. Any analytics used is cookieless (Vercel Web Analytics) and does not
          identify individual visitors.
        </p>
      </section>
      <section>
        <h2 style={sectionHeading}>Contact</h2>
        <p>
          Questions about this policy or your data can be sent to <a href="mailto:support@stafy.com">support@stafy.com</a>.
        </p>
      </section>
    </LegalPage>
  );
}

const sectionHeading = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--font-size-lg)', color: 'var(--color-text)', marginBottom: 8 };
const listStyle = { display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 20, listStyle: 'disc' };

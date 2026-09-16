import { useDocumentHead } from '../../../lib/useDocumentHead.js';
import { LegalPage } from './LegalPage.jsx';

export function TermsPage() {
  useDocumentHead({ title: 'Terms — Stafy' });

  return (
    <LegalPage title="Terms">
      <section>
        <h2 style={sectionHeading}>Nature of this project</h2>
        <p>
          Stafy is a practical assessment project built for AppTrait Solutions. It is provided for evaluation and
          demonstration purposes only, "as is", with no warranty of availability, accuracy, or fitness for any
          particular purpose.
        </p>
      </section>
      <section>
        <h2 style={sectionHeading}>Demo accounts</h2>
        <p>
          Demo credentials shown on the sign-in page are intentionally public so evaluators can access the live demo.
          Do not treat demo accounts as private, and do not reuse a real password for them.
        </p>
      </section>
      <section>
        <h2 style={sectionHeading}>Acceptable use</h2>
        <p>
          Use the demo to evaluate the application's functionality. Don't use it to store real personal or
          confidential information, and don't attempt to disrupt the service for other evaluators.
        </p>
      </section>
      <section>
        <h2 style={sectionHeading}>No self-registration</h2>
        <p>
          Accounts are provisioned by HR, including role and reporting manager. There is no public sign-up; new
          accounts are activated from an invite link.
        </p>
      </section>
      <section>
        <h2 style={sectionHeading}>Contact</h2>
        <p>
          Questions about these terms can be sent to <a href="mailto:support@stafy.com">support@stafy.com</a>.
        </p>
      </section>
    </LegalPage>
  );
}

const sectionHeading = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--font-size-lg)', color: 'var(--color-text)', marginBottom: 8 };

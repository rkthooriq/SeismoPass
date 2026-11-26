import { useId } from 'react';
import Notice from '../../components/Notice';
import { getActor } from '../../lib/actorAccess';
import type { ActorRole } from '../../lib/actorAccess';
import { commonGuideQuestions, usageGuides } from '../../lib/usageGuide';
import './usage-guide.css';

export default function UsageGuide({ role }: { role: ActorRole }) {
  const id = useId();
  const guide = usageGuides[role];
  const questions = [...guide.questions, ...commonGuideQuestions];
  return (
    <div className="usage-guide">
      <section className="ws-panel guide-steps" aria-labelledby={`${id}-steps`}>
        <h2 id={`${id}-steps`}>Langkah untuk {getActor(role).shortName}</h2>
        <ol>
          {guide.steps.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <a className="ws-secondary" href={`#/dashboard/${step.page}`}>
                {step.action}
              </a>
            </li>
          ))}
        </ol>
      </section>
      <section
        className="ws-panel guide-faq"
        aria-labelledby={`${id}-questions`}
      >
        <h2 id={`${id}-questions`}>Saat menemui kendala</h2>
        <div>
          {questions.map(({ question, answer }) => (
            <details className="guide-question" key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
        <Notice tone="info" title="Pahami batas hasil dan QR">
          <p>
            RVS adalah penyaringan awal, bukan sertifikat aman. Simulasi dan QR
            bersifat pendidikan serta belum divalidasi ahli. QR hanya memuat
            informasi simulasi terbatas, bukan identitas atau alamat pribadi.
          </p>
          <p>
            Dukungan biaya, pembiayaan, asuransi, dan insentif bergantung pada
            program serta kesepakatan yang tersedia.
          </p>
        </Notice>
      </section>
    </div>
  );
}

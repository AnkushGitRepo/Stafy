import { EmptyState } from '../../../components/ui/EmptyState.jsx';

/** @param {{ title: string }} props */
export function ComingSoonPage({ title }) {
  return <EmptyState title={title} body="This page ships in the next phase." />;
}

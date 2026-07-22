import AdminPanel from '../components/AdminPanel';
import AdminPasswordGate from '../components/AdminPasswordGate';
import { ScrollToTop } from '../shared/ScrollToTop';

export default function Admin() {
  return (
    <div>
      <ScrollToTop />
      <AdminPasswordGate>
        <AdminPanel />
      </AdminPasswordGate>
    </div>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Customer from '@/pages/Customer';
import Plan from '@/pages/Plan';
import RedLine from '@/pages/RedLine';
import Approval from '@/pages/Approval';
import Reminder from '@/pages/Reminder';
import Trace from '@/pages/Trace';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/redline" element={<RedLine />} />
          <Route path="/approval" element={<Approval />} />
          <Route path="/reminder" element={<Reminder />} />
          <Route path="/trace" element={<Trace />} />
        </Route>
      </Routes>
    </Router>
  );
}

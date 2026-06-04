import { Outlet, useParams } from 'react-router-dom';
import AdminHeader from "../../components/admin/adminHeader";

export function AdminDashboard() {
  const { section } = useParams();
  const activeSection = section || 'vue';

  return (
   <>
    <section className="min-h-screen bg-slate-50">
        <AdminHeader />
        <main className="px-6 py-8">
          <Outlet />
        </main>
    </section>
   </>
  );
}
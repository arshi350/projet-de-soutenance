import IntelligentDesign from "../../../components/dashboard/event/manageEvent/personnalisation/IntelligentDesign";
import { useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import { useGetTemplate } from '../../../hooks/useTemplates';

export function Personnalisation() {
  const [searchParams] = useSearchParams();
  const { token } = useAuthContext();
  const templateId = searchParams.get('templateId');
  const { template, loading, error } = useGetTemplate(templateId, token);

  return (
    <div className="p-6">
      {!templateId ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
          Sélectionnez un template depuis l'onglet <strong>Templates</strong> pour commencer la personnalisation IA.
        </div>
      ) : (
      <IntelligentDesign template={template} templateLoading={loading} templateError={error} />
      )}
    </div>
  );
}
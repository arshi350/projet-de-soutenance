import IntelligentDesign from "../../../components/dashboard/event/manageEvent/personnalisation/IntelligentDesign";
import { useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import { useGetTemplate } from '../../../hooks/useTemplates';

export function Personnalisation({ eventInfo }) {
  const [searchParams] = useSearchParams();
  const { token } = useAuthContext();
  const templateId = searchParams.get('templateId');
  const { template, loading, error } = useGetTemplate(templateId, token);

  return (
    <div>
      <IntelligentDesign 
        template={template} 
        templateLoading={loading} 
        templateError={error} 
        eventInfo={eventInfo}
      />
    </div>
  );
}
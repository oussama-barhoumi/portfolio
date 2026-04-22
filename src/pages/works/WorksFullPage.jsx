import WorksPage from '../../components/WorksPage'
import { useNavigate } from 'react-router-dom'

export default function WorksFullPage() {
  const navigate = useNavigate()
  // WorksPage expects open/onClose — we pass open=true and onClose goes back
  return <WorksPage open={true} onClose={() => navigate(-1)} />
}

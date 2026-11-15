import { useApp } from '../context/AppContext'
import { CreatorStudio } from '../components/CreatorStudio'
import { Button } from '../components/UI'
import { Sparkles, Upload } from 'lucide-react'

export function CreatorStudioPage({ onNewReview }) {
  const { data, toast } = useApp()

  return (
    <div className="creator-studio-page">
      <section className="page-head">
        <div>
          <div className="creator-studio-page__badge-row">
            <span className="creator-role-tag">Team Member Workspace</span>
          </div>
          <h1>Creator Studio</h1>
          <p>
            Author, pre-flight, and refine draft content against Aster &amp; Oak brand guidelines before
            formal governance review.
          </p>
        </div>
      </section>

      <CreatorStudio
        submissions={data?.submissions || []}
        onNewReview={onNewReview}
        toast={toast}
      />
    </div>
  )
}

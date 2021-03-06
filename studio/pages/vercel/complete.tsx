import { createContext, useEffect, useState } from 'react'
import { observer, useLocalObservable } from 'mobx-react-lite'
import VercelIntegrationLayout from 'components/layouts/VercelIntegrationLayout'
import { Button, Typography, IconLoader } from '@supabase/ui'

const PageContext = createContext(null)
function IntegrationComplete() {
  const PageState = useLocalObservable(() => ({
    supabaseProjectRef: '',
    next: '',
    loadInitialData() {
      this.getQueryParams()
    },
    getQueryParams() {
      const params = new URLSearchParams(window.location.search)
      this.next = params.get('next') as string
      this.supabaseProjectRef = params.get('supabaseProjectRef') as string
    },
  }))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    PageState.loadInitialData()
  }, [])

  function onContinue() {
    setLoading(true)
    window.location.href = PageState.next
  }

  return (
    // @ts-ignore
    <PageContext.Provider value={PageState}>
      <VercelIntegrationLayout>
        <div className="max-w-sm mx-auto">
          <IconLoader className="animate-spin" size={30} />
          <Typography.Title level={3}>
            <p className="pt-4">Your new project is spinning up</p>
          </Typography.Title>
          <Typography.Text>
            <p className="pt-2">This may take up to 2 mins, but you can continue on Vercel.</p>
          </Typography.Text>

          <div className="py-4">
            <a
              href={`/project/${PageState.supabaseProjectRef}`}
              target="_blank"
              className="hover:text-green-500"
            >
              <Typography.Text>Open Supabase Dashboard →</Typography.Text>
            </a>
          </div>

          <Button disabled={loading} loading={loading} onClick={onContinue} block>
            Finish
          </Button>
        </div>
      </VercelIntegrationLayout>
    </PageContext.Provider>
  )
}
export default observer(IntegrationComplete)

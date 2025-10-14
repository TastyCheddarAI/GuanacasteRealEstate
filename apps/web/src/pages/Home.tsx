import { Card, CardContent, CardHeader, CardTitle } from '@guanacaste-real/ui'
import TownsSection from '../components/TownsSection'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Home Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Welcome to Guanacaste Real - Home</p>
          </CardContent>
        </Card>
      </div>
      <TownsSection />
    </div>
  )
}
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui'

export default function Explore() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Explore Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Explore properties in Guanacaste</p>
        </CardContent>
      </Card>
    </div>
  )
}
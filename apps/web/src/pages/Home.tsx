import { Card, CardContent, CardHeader, CardTitle } from '@guanacaste-real/ui'

export default function Home() {
  return (
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
  )
}
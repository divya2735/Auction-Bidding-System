import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts"
import PageContent from "../components/PageContent";

const Dashboard = () => (
  <PageContent
    title="Dashboard"
    content="Welcome to your dashboard! This is the main overview of your account."
  />
);

const revenueData = [
  { month: "Jan", revenue: 1200 },
  { month: "Feb", revenue: 2100 },
  { month: "Mar", revenue: 1800 },
  { month: "Apr", revenue: 2500 },
]

const SellerDashboard = () => {
  const [auctions] = useState([
    { id: 1, item: "MacBook Pro", bids: 12, revenue: 2200, status: "Closed" },
    { id: 2, item: "iPad Pro", bids: 5, revenue: 800, status: "Active" },
  ])

  return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader><CardTitle>Total Auctions</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">45</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Active</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">12</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Closed</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">33</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">₹18,900</p></CardContent>
          </Card>
        </div>

        {/* Auctions Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Bids</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auctions.map(a => (
              <TableRow key={a.id}>
                <TableCell>{a.item}</TableCell>
                <TableCell>{a.bids}</TableCell>
                <TableCell>${a.revenue}</TableCell>
                <TableCell>{a.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Revenue Chart */}
        <Card>
          <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
  )
}

export default SellerDashboard

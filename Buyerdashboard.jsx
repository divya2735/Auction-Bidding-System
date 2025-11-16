import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts"
import PageContent from "../components/PageContent";

const bidData = [
  { date: "Sep 1", bids: 2 },
  { date: "Sep 2", bids: 5 },
  { date: "Sep 3", bids: 1 },
  { date: "Sep 4", bids: 4 },
  { date: "Sep 5", bids: 6 },
]

const BuyerDashboard = () => {
  const [auctions] = useState([
    { id: 1, item: "iPhone 15", price: 950, status: "Active" },
    { id: 2, item: "PS5", price: 500, status: "Won" },
  ])

  return (
        <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Buyer Dashboard</h1>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
            <CardHeader><CardTitle>Total Bids</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">120</p></CardContent>
            </Card>
            <Card>
            <CardHeader><CardTitle>Auctions Won</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">8</p></CardContent>
            </Card>
            <Card>
            <CardHeader><CardTitle>Orders Placed</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">5</p></CardContent>
            </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active">
            <TabsList>
            <TabsTrigger value="active">Active Auctions</TabsTrigger>
            <TabsTrigger value="won">Won Auctions</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {auctions.filter(a => a.status === "Active").map(a => (
                    <TableRow key={a.id}>
                    <TableCell>{a.item}</TableCell>
                    <TableCell>${a.price}</TableCell>
                    <TableCell>{a.status}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TabsContent>

            <TabsContent value="won">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {auctions.filter(a => a.status === "Won").map(a => (
                    <TableRow key={a.id}>
                    <TableCell>{a.item}</TableCell>
                    <TableCell>${a.price}</TableCell>
                    <TableCell>{a.status}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TabsContent>
        </Tabs>

        {/* Bids Over Time Chart */}
        <Card>
            <CardHeader><CardTitle>Bids Over Time</CardTitle></CardHeader>
            <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bidData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bids" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
            </CardContent>
        </Card>
        </div>
  )
}

export default BuyerDashboard

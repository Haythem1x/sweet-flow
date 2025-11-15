"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Store } from 'lucide-react'

interface Customer {
  id: string
  shop_name: string
  owner_name: string
  phone: string
  address: string
  latitude?: number | null
  longitude?: number | null
  outstanding_balance: number
}

interface CustomerMapViewProps {
  customers: Customer[]
}

export function CustomerMapView({ customers }: CustomerMapViewProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Filter customers with coordinates
  const customersWithLocation = customers.filter((c) => c.latitude && c.longitude)

  // Calculate map center (average of all coordinates)
  const mapCenter =
    customersWithLocation.length > 0
      ? {
          lat: customersWithLocation.reduce((sum, c) => sum + (c.latitude || 0), 0) / customersWithLocation.length,
          lng: customersWithLocation.reduce((sum, c) => sum + (c.longitude || 0), 0) / customersWithLocation.length,
        }
      : { lat: 36.8065, lng: 10.1815 } // Default to Tunis, Tunisia

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map Display */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Customer Locations Map
          </CardTitle>
          <CardDescription>
            {customersWithLocation.length} of {customers.length} customers have location data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[500px] bg-muted rounded-lg overflow-hidden">
            {/* Embedded Google Maps */}
            {customersWithLocation.length > 0 ? (
              <iframe
                title="Customer Locations Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${mapCenter.lat},${mapCenter.lng}&zoom=12`}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center space-y-2">
                  <MapPin className="w-12 h-12 mx-auto opacity-50" />
                  <p className="text-sm">No customer locations available</p>
                  <p className="text-xs">Add coordinates when creating/editing customers</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick links to individual customer maps */}
          {customersWithLocation.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {customersWithLocation.map((customer) => (
                <a
                  key={customer.id}
                  href={`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors flex items-center gap-1"
                  onMouseEnter={() => setSelectedCustomer(customer)}
                  onMouseLeave={() => setSelectedCustomer(null)}
                >
                  <MapPin className="w-3 h-3" />
                  {customer.shop_name}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer List Sidebar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer List</CardTitle>
          <CardDescription>Click on a location to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {customersWithLocation.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No customers with location data yet
              </p>
            ) : (
              customersWithLocation.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedCustomer?.id === customer.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted border-border"
                  }`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-sm">{customer.shop_name}</h4>
                    </div>
                    {customer.outstanding_balance > 0 && (
                      <span className="text-xs font-bold text-orange-600">
                        {customer.outstanding_balance.toFixed(3)} TND
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{customer.owner_name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Phone className="w-3 h-3" />
                    {customer.phone}
                  </div>
                  {customer.address && <p className="text-xs text-muted-foreground mb-2">{customer.address}</p>}
                  <a
                    href={`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Open in Google Maps
                  </a>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

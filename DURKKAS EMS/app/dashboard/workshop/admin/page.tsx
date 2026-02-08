"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Award } from "lucide-react";

export default function WorkshopAdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 sm:p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-orange-100">Workshop Portal</p>
        </div>
      </div>
      <div className="container mx-auto p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Workshop Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Workshops</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">456</div>
                <div className="text-sm text-muted-foreground">Participants</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">420</div>
                <div className="text-sm text-muted-foreground">Certificates</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


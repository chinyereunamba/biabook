import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, X } from "lucide-react";

export function ServicesStep({
  services,
  setServices,
}: {
  services: { name: string; duration: string; price: string }[];
  setServices: (s: any) => void;
}) {
  const addService = () => {
    setServices([...services, { name: "", duration: "", price: "" }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: string, value: string) => {
    const updated = services.map((service, i) =>
      i === index ? { ...service, [field]: value } : service
    );
    setServices(updated);
  };

  return (
    <Card className="border-gray-200 shadow-lg">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
          <Calendar className="h-6 w-6 text-purple-600" />
        </div>
        <CardTitle className="text-2xl">Add your services</CardTitle>
        <CardDescription>
          What services do you offer? You can always add more later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="space-y-4 rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Service {index + 1}</h4>
              {services.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeService(index)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Service Name *</Label>
                <Input
                  placeholder="e.g. Hair Cut & Style"
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  value={service.name}
                  onChange={(e) => updateService(index, "name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes) *</Label>
                <Input
                  type="number"
                  placeholder="45"
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  value={service.duration}
                  onChange={(e) =>
                    updateService(index, "duration", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price ($) *</Label>
                <Input
                  type="number"
                  placeholder="50"
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  value={service.price}
                  onChange={(e) => updateService(index, "price", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addService}
          className="w-full border-gray-300 hover:bg-gray-50 bg-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Service
        </Button>
      </CardContent>
    </Card>
  );
}

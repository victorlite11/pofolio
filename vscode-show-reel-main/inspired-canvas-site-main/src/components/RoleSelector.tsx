import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const RoleSelector = () => {
  const navigate = useNavigate();

  console.log('RoleSelector component rendering');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="bg-card text-card-foreground w-full max-w-md rounded-2xl border shadow-lg">
        <CardContent className="p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Who are you?
          </h1>
          <p className="text-muted-foreground mb-8">
            Choose your experience:
          </p>
          
          <div className="space-y-4">
            <Button 
              variant="default"
              size="lg"
              className="w-full"
              onClick={() => navigate('/developer')}
            >
              Developer
            </Button>
            
            <Button 
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/client')}
            >
              Client
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelector;
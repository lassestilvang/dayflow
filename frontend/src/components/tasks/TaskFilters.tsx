import { Button } from "@/components/ui/button";

export function TaskFilters() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        All
      </Button>
      <Button variant="outline" size="sm">
        Pending
      </Button>
      <Button variant="outline" size="sm">
        Completed
      </Button>
    </div>
  );
}

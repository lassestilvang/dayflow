import { Button } from "@/components/ui/button";
import { useDeleteCollaboration } from "@/lib/api";
import type { Collaboration } from "@/lib/api";

interface ManageSharedResourcesProps {
  collaborations: Collaboration[];
  resourceType: "task" | "event";
}

export function ManageSharedResources({
  collaborations,
  resourceType,
}: ManageSharedResourcesProps) {
  const deleteCollaboration = useDeleteCollaboration();

  const handleRemove = async (id: number) => {
    try {
      await deleteCollaboration.mutateAsync(id);
    } catch (error) {
      console.error("Failed to remove collaborator", error);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-background">
      <h3 className="text-lg font-semibold mb-4">
        Shared {resourceType === "task" ? "Task" : "Event"} Collaborators
      </h3>
      <div className="space-y-2">
        {collaborations.map((collab) => (
          <div
            key={collab.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div>
              <div className="font-medium">{collab.user.name}</div>
              <div className="text-sm text-muted-foreground">
                {collab.user.email}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                Role: {collab.role}
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemove(collab.id)}
              disabled={deleteCollaboration.isPending}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

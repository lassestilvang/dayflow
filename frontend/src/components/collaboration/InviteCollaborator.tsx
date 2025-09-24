import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCollaboration } from "@/lib/api";

interface InviteCollaboratorProps {
  resourceType: "task" | "event";
  resourceId: number;
  onClose: () => void;
}

export function InviteCollaborator({
  resourceType,
  resourceId,
  onClose,
}: InviteCollaboratorProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"read" | "write" | "admin">("write");
  const createCollaboration = useCreateCollaboration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCollaboration.mutateAsync({
        resource_type: resourceType,
        resource_id: resourceId,
        collaborator_email: email,
        role,
      });
      onClose();
    } catch (error) {
      console.error("Failed to invite collaborator", error);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-background">
      <h3 className="text-lg font-semibold mb-4">Invite Collaborator</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <Select
            value={role}
            onValueChange={(value: "read" | "write" | "admin") =>
              setRole(value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="write">Write</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={createCollaboration.isPending}>
            {createCollaboration.isPending ? "Inviting..." : "Invite"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

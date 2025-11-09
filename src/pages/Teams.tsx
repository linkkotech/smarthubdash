import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { InviteMemberModal } from "@/components/teams/InviteMemberModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export default function Teams() {
  const { setConfig } = usePageHeader();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isPlatformAdmin } = usePermissions();

  useEffect(() => {
    setConfig({
      title: "Equipe",
      primaryAction: isPlatformAdmin ? {
        label: "Convidar Membro",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => setIsModalOpen(true),
      } : undefined,
    });
  }, [setConfig, isPlatformAdmin]);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, user_roles!inner(role)")
      .in("user_roles.role", ["super_admin", "admin", "manager"]);

    if (error) {
      console.error("Error fetching members:", error);
    } else {
      const formattedMembers = data.map((member: any) => ({
        id: member.id,
        full_name: member.full_name,
        email: member.email,
        role: member.user_roles?.[0]?.role || "Sem papel",
      }));
      setMembers(formattedMembers);
    }
    setLoading(false);
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      case "manager":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      default:
        return "Sem papel";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0">
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow 
                  className="hover:bg-transparent"
                  style={{ borderBottom: 'none' }}
                >
                  <TableHead className="py-4 px-6">Nome</TableHead>
                  <TableHead className="py-4 px-6">Email</TableHead>
                  <TableHead className="py-4 px-6">Papel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow 
                    key={member.id}
                    className="bg-white hover:bg-muted/50 mb-3 transition-colors"
                    style={{ borderBottom: 'none', borderRadius: '8px', overflow: 'hidden' }}
                  >
                    <TableCell className="font-medium py-4 px-6">
                      {member.full_name}
                    </TableCell>
                    <TableCell className="py-4 px-6">{member.email}</TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {getRoleLabel(member.role)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InviteMemberModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={fetchMembers}
      />
    </div>
  );
}

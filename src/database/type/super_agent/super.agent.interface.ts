import { SuperAdmin } from "../../entities/company.entity";
import { User } from "../../entities/user.entity";
import { PermissionStatus } from "../../enum/permission.enum";

export interface SuperAgentInterface {
  id: string;
  status?: PermissionStatus;
  package: number;
  user: User;
  company: SuperAdmin;
  super_id?: string;
  created_at: Date;
}
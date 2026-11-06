export type UserRole =
  | 'student'
  | 'departmenthead'
  | 'librarian'
  | 'cafeteria'
  | 'psychology'
  | 'sportmaster'
  | 'campuspolice'
  | 'cooperationsharing'
  | 'dopcordinator'
  | 'studentaffairs'
  | 'dormitory'
  | 'registrar'
  | 'admin';

export interface User {
  id: string | number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role: UserRole;
  token?: string;
  id_number?: string;
  department_name?: string;
  college_name?: string;
  phone?: string;
  profile_picture_url?: string;
  date_joined?: string;
  last_login?: string;
  last_password_change?: string;
  building_id?: number | string;
  building_name?: string;
}

// ---------- Clearance workflow ----------
// ✅ UPDATED: Simplified statuses for the dynamic engine
export type FormStatus =
  | 'in_progress'
  | 'Cleared by Registrar'
  | 'rejected'
  | 'requires_payment';

// ✅ NEW: Dynamic Workflow Step
export interface WorkflowStep {
  id: number;
  name: string;
  role_required: string;
  order: number;
  is_active: boolean;
}

// ✅ NEW: Dynamic Approval History
export interface ClearanceApproval {
  id: number;
  form: number;
  step: number;
  step_name?: string;
  step_order?: number;
  approved_by: number | null;
  approved_by_name?: string;
  note: string;
  status: string;
  timestamp: string;
}

export interface ClearanceForm {
  id: number | string;
  student_id: string | number;
  full_name: string;
  id_number: string;
  student_email: string;
  college: string;
  department_name: string;
  program_level: string;
  enrollment_type: string;
  year: string;
  semester: string;
  reason: string;
  created_at: string;
  updated_at: string;
  can_resubmit?: boolean;

  // ✅ NEW DYNAMIC FIELDS
  overall_status: FormStatus;
  current_step?: WorkflowStep | null;
  approvals?: ClearanceApproval[];

  // Building info if applicable
  building?: {
    id: number | string;
    name: string;
    code?: string;
  };
}

// ---------- Payments ----------
export interface PaymentMethod {
  id: number;
  name: string;
  account_name: string;
  account_number: string;
  bank_name?: string;
  phone_number?: string;
  instructions?: string;
  is_active?: boolean;
}

export interface PaymentRecord {
  id: number | string;
  transaction_id: string;
  student_id: string;
  student_name: string;
  department_type: string;
  amount: number | string;
  payment_method_id: number;
  payment_method_name?: string;
  payment_method?: {
    name: string;
  };
  payment_date: string;
  phone_number?: string;
  account_last_digits?: string;
  receipt_url?: string;
  note?: string;
  clearance_form_id?: number | string;
  status: 'pending' | 'verified' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  verified_at?: string;
  verified_by?: {
    username: string;
  };
  verified_by_name?: string;
}

export interface DueRecord {
  id: number | string;
  student_id: string;
  student_name: string;
  room_number?: string;
  description: string;
  book_title?: string;
  book_id?: string;
  incident_type?: string;
  cooperation_type?: string;
  program_type?: string;
  items?: string[];
  amount: number;
  fine_amount?: number;
  due_date: string;
  borrow_date?: string;
  status: 'overdue' | 'due_soon' | 'pending' | 'resolved' | 'cleared';
  registered_date: string;
  registered_by: string;
  payment_status?: 'paid' | 'pending' | 'unpaid';
  requirements?: string[];
  resolution_date?: string;
}

// ---------- Chat ----------
export interface ChatMessage {
  id: number | string;
  room_id: number | string;
  content: string;
  message_type?: 'text' | 'image' | 'audio' | 'video' | 'file';
  image_file?: string;
  audio_file?: string;
  video_file?: string;
  file?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
  is_own?: boolean;
  is_read?: boolean;
  sender?: {
    id: string | number;
    username: string;
    full_name?: string;
    role?: string;
  };
}

export interface ChatRoom {
  id: number | string;
  name?: string;
  student_id?: string;
  student_name?: string;
  staff_role?: string;
  staff_name?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  student?: {
    id: string | number;
    full_name: string;
    id_number: string;
    email?: string;
  };
  other_participant?: {
    id: string | number;
    username: string;
    full_name: string;
    role?: string;
  };
}

// ---------- Admin / Reference data ----------
export interface ValidStudentCSV {
  id: number | string;
  first_name: string;
  last_name: string;
  full_name: string;
  id_number: string;
  email?: string;
  college: string;
  department: string;
  year_of_admission: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  is_registered: boolean;
  registered_at?: string;
}

export interface Building {
  id: number;
  name: string;
  code: string;
}

export interface College {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  college: number;
  name: string;
}
export interface PropertyItem {
  item: string;
  quantity: number;
  description: string;
}

export interface PropertyExitPass {
  id: number;
  student: number;
  student_name: string;
  student_id_num: string;
  items: PropertyItem[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  dorm_note: string;
  approved_by_name?: string;
  updated_at: string;
}

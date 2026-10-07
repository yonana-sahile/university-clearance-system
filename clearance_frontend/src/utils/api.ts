
import {
  User,
  ClearanceForm,
  PaymentMethod,
  PaymentRecord,
  DueRecord,
  ValidStudentCSV,
  College,
  Department,
  Building,
} from '../types';


export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/";

export function getSession(): User | null {
  try {
    const raw = sessionStorage.getItem("ucs_current");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.user || parsed;
  } catch {
    return null;
  }
}

export function setSession(user: User): void {
  sessionStorage.setItem("ucs_current", JSON.stringify(user));
  if (user.token) {
    sessionStorage.setItem("ucs_token", user.token);
    sessionStorage.setItem("token", user.token);
  }
}

export function clearSession(): void {
  sessionStorage.removeItem("ucs_current");
  sessionStorage.removeItem("ucs_token");
  sessionStorage.removeItem("token");
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${API_BASE}${cleanEndpoint}`;

  const token =
    sessionStorage.getItem("token") || sessionStorage.getItem("ucs_token");
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!isFormData && options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log(`[API] ${options.method || "GET"} -> ${url}`);

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("ucs_token");
    sessionStorage.removeItem("ucs_current");
    throw new Error("Unauthorized. Please log in again.");
  }

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

const LS_KEYS = {
  forms: "ucs_forms",
  colleges: "ucs_colleges",
  departments: "ucs_departments",
  buildings: "ucs_buildings",
  validStudents: "ucs_valid_students",
  dues: "ucs_dues",
  paymentMethods: "ucs_payment_methods",
  paymentRecords: "ucs_payment_records",
} as const;

function lsRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsWrite<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

// ---------- Clearance forms ----------
export function getStoredForms(): ClearanceForm[] {
  return lsRead<ClearanceForm[]>(LS_KEYS.forms, []);
}

export function setStoredForms(forms: ClearanceForm[]): void {
  lsWrite(LS_KEYS.forms, forms);
}

// ---------- Reference data: colleges, departments, buildings ----------
export function getStoredColleges(): College[] {
  return lsRead<College[]>(LS_KEYS.colleges, [
    { id: 1, name: "College of Computing & Informatics" },
    { id: 2, name: "College of Engineering & Technology" },
    { id: 3, name: "College of Natural Sciences" },
    { id: 4, name: "College of Business & Economics" },
    { id: 5, name: "College of Social Sciences & Humanities" },
  ]);
}

export function getStoredDepartments(): Department[] {
  return lsRead<Department[]>(LS_KEYS.departments, [
    { id: 1, college: 1, name: "Software Engineering" },
    { id: 2, college: 1, name: "Computer Science" },
    { id: 3, college: 1, name: "Information Technology" },
    { id: 4, college: 2, name: "Civil Engineering" },
    { id: 5, college: 2, name: "Electrical Engineering" },
    { id: 6, college: 3, name: "Biology" },
    { id: 7, college: 3, name: "Chemistry" },
  ]);
}

export function getStoredBuildings(): Building[] {
  return lsRead<Building[]>(LS_KEYS.buildings, [
    { id: 1, name: "Block A (Male)", code: "A" },
    { id: 2, name: "Block B (Male)", code: "B" },
    { id: 3, name: "Block C (Female)", code: "C" },
    { id: 4, name: "Block D (Female)", code: "D" },
  ]);
}

// ---------- Valid students (admin CSV-backed database) ----------
export function getStoredValidStudents(): ValidStudentCSV[] {
  return lsRead<ValidStudentCSV[]>(LS_KEYS.validStudents, [
    {
      id: 1,
      id_number: "AAA1234",
      first_name: "Yonas",
      last_name: "Sahile",
      full_name: "Yonas Sahile",
      email: "yonassahile8@gmail.com",
      college: "College of Computing & Informatics",
      department: "Software Engineering",
      year_of_admission: "2022",
      status: "active",
      is_registered: false,
    },
    {
      id: 2,
      id_number: "STU001",
      first_name: "Mamitu",
      last_name: "Tadese",
      full_name: "Mamitu Tadese",
      email: "mamitu@mau.edu.et",
      college: "College of Engineering & Technology",
      department: "Civil Engineering",
      year_of_admission: "2021",
      status: "active",
      is_registered: false,
    },
    {
      id: 3,
      id_number: "STU002",
      first_name: "Tigist",
      last_name: "Haile",
      full_name: "Tigist Haile",
      email: "tigist@mau.edu.et",
      college: "College of Natural Sciences",
      department: "Biology",
      year_of_admission: "2022",
      status: "active",
      is_registered: false,
    },
  ]);
}

export function setStoredValidStudents(list: ValidStudentCSV[]): void {
  lsWrite(LS_KEYS.validStudents, list);
}

// ---------- Dues / fines (library, cafeteria, dormitory) ----------
export function getStoredDues(): DueRecord[] {
  return lsRead<DueRecord[]>(LS_KEYS.dues, []);
}

export function setStoredDues(list: DueRecord[]): void {
  lsWrite(LS_KEYS.dues, list);
}

// ---------- Payment methods ----------
export function getStoredPaymentMethods(): PaymentMethod[] {
  return lsRead<PaymentMethod[]>(LS_KEYS.paymentMethods, [
    {
      id: 1,
      name: "Telebirr Mobile Money",
      account_name: "Mekdela Amba University",
      account_number: "0921459991",
      phone_number: "0921459991",
      instructions:
        "1. Dial *127# on your phone\n" +
        "2. Select \"Pay Bill\"\n" +
        "3. Enter merchant code 0921459991\n" +
        "4. Use your Student ID as the reference\n" +
        "5. Save the SMS confirmation",
      is_active: true,
    },
    {
      id: 2,
      name: "CBE Birr",
      account_name: "Mekdela Amba University",
      account_number: "1000123456789",
      bank_name: "Commercial Bank of Ethiopia",
      instructions:
        "1. Dial *847# on your phone\n" +
        "2. Select \"Pay to Account\"\n" +
        "3. Enter account 1000123456789\n" +
        "4. Use your Student ID as the reference\n" +
        "5. Save the SMS confirmation",
      is_active: true,
    },
  ]);
}

// ---------- Payment records (student history) ----------
export function getStoredPaymentRecords(): PaymentRecord[] {
  return lsRead<PaymentRecord[]>(LS_KEYS.paymentRecords, []);
}

export function setStoredPaymentRecords(list: PaymentRecord[]): void {
  lsWrite(LS_KEYS.paymentRecords, list);
}

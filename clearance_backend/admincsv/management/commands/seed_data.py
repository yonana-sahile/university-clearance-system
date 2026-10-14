from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import College, Department, Building
from admincsv.models import ValidStudent
from payments.models import PaymentMethod

User = get_user_model()


COLLEGES = [
    "College of Engineering & Technology",
    "College of Computing & Informatics",
    "College of Business & Economics",
    "College of Natural & Computational Sciences",
    "College of Social Sciences & Humanities",
    "College of Medicine & Health Sciences",
    "College of Agriculture & Environmental Sciences",
]

DEPARTMENTS = [
    (2, "Software Engineering"),
    (2, "Computer Science"),
    (2, "Information Technology"),
    (1, "Civil Engineering"),
    (1, "Electrical & Computer Engineering"),
    (1, "Mechanical Engineering"),
    (3, "Accounting & Finance"),
    (3, "Management"),
    (3, "Economics"),
    (4, "Physics"),
    (4, "Chemistry"),
    (4, "Mathematics"),
    (5, "English Language & Literature"),
    (6, "Medicine"),
    (6, "Nursing"),
]

BUILDINGS = [
    ("Dormitory Block A (Male)", "BLK-A"),
    ("Dormitory Block B (Male)", "BLK-B"),
    ("Dormitory Block C (Female)", "BLK-C"),
    ("Dormitory Block D (Female)", "BLK-D"),
    ("Dormitory Block E (Postgraduate)", "BLK-E"),
    ("Freshman Residence Hall", "FRESH-01"),
]

PAYMENT_METHODS = [
    ("Telebirr Mobile Money", "Mekdela Amba University Revenue", "0921459991", "", "0921459991",
     "Dial *127# and send to 0921459991"),
    ("Commercial Bank of Ethiopia (CBE Birr)", "Mekdela Amba University Clearance Fund",
     "1000189342512", "Commercial Bank of Ethiopia", "", "Transfer to CBE 1000189342512"),
    ("Awash Bank Mobile Banking", "MAU Finance Account", "01320874512900", "Awash Bank S.C.", "",
     "Transfer to Awash 01320874512900"),
    ("Bank of Abyssinia (BOA)", "Mekdela Amba University", "89341256", "Bank of Abyssinia", "",
     "BOA Account 89341256"),
]

VALID_STUDENTS = [
    ("Yonas", "Sahile", "AAA1234", "yonassahile8@gmail.com",
     "College of Computing & Informatics", "Software Engineering", "2022", True),
    ("Abebe", "Bikila", "STU001", "abebe.bikila@mau.edu.et",
     "College of Computing & Informatics", "Computer Science", "2021", True),
    ("Tigist", "Haile", "STU002", "tigist.haile@mau.edu.et",
     "College of Engineering & Technology", "Civil Engineering", "2022", True),
    ("Kebede", "Tessema", "STU003", "",
     "College of Business & Economics", "Accounting & Finance", "2021", False),
    ("Mesfin", "Worku", "STU004", "",
     "College of Natural & Computational Sciences", "Physics", "2020", False),
    ("Sara", "Mulugeta", "2024CS001", "sara.mulugeta@mau.edu.et",
     "College of Computing & Informatics", "Software Engineering", "2022", True),
]


class Command(BaseCommand):
    help = 'Seed database with initial data'

    def handle(self, *args, **kwargs):
        # ---------- Colleges ----------
        for name in COLLEGES:
            College.objects.get_or_create(name=name)

        # ---------- Departments ----------
        for college_id, dept_name in DEPARTMENTS:
            college = College.objects.get(id=college_id)
            Department.objects.get_or_create(college=college, name=dept_name)

        # ---------- Buildings ----------
        for name, code in BUILDINGS:
            Building.objects.get_or_create(code=code, defaults={'name': name})

        # ---------- Payment methods ----------
        for name, acc_name, acc_num, bank, phone, instr in PAYMENT_METHODS:
            PaymentMethod.objects.get_or_create(
                name=name,
                defaults={
                    'account_name': acc_name,
                    'account_number': acc_num,
                    'bank_name': bank,
                    'phone_number': phone,
                    'instructions': instr,
                }
            )

        # ---------- Valid students ----------
        for fn, ln, idn, email, cname, dname, year, reg in VALID_STUDENTS:
            college = College.objects.filter(name=cname).first()
            dept = Department.objects.filter(name=dname).first()
            ValidStudent.objects.update_or_create(
                id_number=idn,
                defaults={
                    'first_name': fn,
                    'last_name': ln,
                    'email': email,
                    'college': college,
                    'department': dept,
                    'year_of_admission': year,
                    'is_registered': reg,
                }
            )

        # ---------- Staff users ----------
        # (username, first_name, last_name, role, department_name_or_None)
        staff = [
            ('depthead_se', 'Aster', 'Alemayehu', 'departmenthead', 'Software Engineering'),
            ('librarian_main', 'Mulugeta', 'Yilma', 'librarian', None),
            ('cafeteria_main', 'Getachew', 'Belay', 'cafeteria', None),
            ('psychology_main', 'Bethelhem', 'Tadesse', 'psychology', None),
            ('sportmaster_main', 'Solomon', 'Kassa', 'sportmaster', None),
            ('campuspolice_main', 'Yonas', 'Girma', 'campuspolice', None),
            ('cooperation_main', 'Alemayehu', 'Bogale', 'cooperationsharing', None),
            ('dop_main', 'Bereket', 'Assefa', 'dopcordinator', None),
            ('studentaffairs_main', 'Helen', 'Desta', 'studentaffairs', None),
            ('dormitory_main', 'Tadesse', 'Woldemariam', 'dormitory', None),
            ('registrar_main', 'Registrar', 'Office', 'registrar', None),
            ('admin_mau', 'Admin', 'MAU', 'admin', None),
        ]
        for username, fn, ln, role, dept_name in staff:
            dept = None
            college = None
            if dept_name:
                dept = Department.objects.filter(name=dept_name).first()
                if dept:
                    college = dept.college

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': fn,
                    'last_name': ln,
                    'role': role,
                    'email': f"{username}@mau.edu.et",
                    'department': dept,
                    'college': college,
                }
            )
            if created:
                user.set_password('staff123')
                if username == 'admin_mau':
                    user.is_staff = True
                    user.is_superuser = True
                user.save()
            else:
                # Update existing user (e.g. after redeploy)
                updated = False
                if dept and not user.department:
                    user.department = dept
                    updated = True
                if college and not user.college:
                    user.college = college
                    updated = True
                if username == 'admin_mau' and not user.is_superuser:
                    user.is_staff = True
                    user.is_superuser = True
                    updated = True
                if updated:
                    user.save()

        # ---------- Demo student ----------
        if not User.objects.filter(username='AAA1234').exists():
            User.objects.create_user(
                username='AAA1234',
                password='student123',
                first_name='Yonas',
                last_name='Sahile',
                role='student',
                id_number='AAA1234',
                email='yonassahile8@gmail.com'
            )

        self.stdout.write(self.style.SUCCESS('✅ Seed data loaded!'))
        self.stdout.write('Student login: AAA1234 / student123')
        self.stdout.write('Staff login:   depthead_se / staff123')
        self.stdout.write('Admin login:   admin_mau / staff123')

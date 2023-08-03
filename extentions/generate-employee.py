"""
INSERT INTO public.employees(
    name, phone, role, branch_id, password, "isActive")
VALUES
('NGUYEN VAN DEV', '019231232', 'SHIPPER', '256c5538-b1d2-4683-b007-fd9ccc24f53c', '$2b$10$xgUsVbRkgkqiHGrcQIhL0.7OwluRxKu.m2IHvWJon9F8OhK5m76My', true),
('NGUYEN VAN DEV 1', '01923123', 'EMPLOYEE', '256c5538-b1d2-4683-b007-fd9ccc24f53c', '$2b$10$xgUsVbRkgkqiHGrcQIhL0.7OwluRxKu.m2IHvWJon9F8OhK5m76My', true);
"""


# generate sql insert user
import random
import datetime
import names


def getFullName():
    return names.get_full_name()


def getPhone():
    return "0" + str(random.randint(100000000, 999999999))


def getRole():
    return random.choice(["EMPLOYEE"])


# generate sql insert user
def generateSqlInsertEmployee():
    fullName = getFullName()
    phone = getPhone()
    role = getRole()
    branchId = "256c5538-b1d2-4683-b007-fd9ccc24f53c"
    password = "$2b$10$xgUsVbRkgkqiHGrcQIhL0.7OwluRxKu.m2IHvWJon9F8OhK5m76My"
    sql = f"('{fullName}', '{phone}', '{role}', '{branchId}', '{password}', true)"
    return sql


def generateSqlInsertEmployees():
    sql = 'INSERT INTO public.employees (name, phone, role, branch_id, password, "isActive") VALUES '
    for i in range(1000):
        sql += generateSqlInsertEmployee()
        sql += ",\n"

    sql = sql[:-2]
    sql += ";"
    return sql


sql = generateSqlInsertEmployees()

# save to file
f = open("generate-employee.sql", "w")
f.write(sql)
f.close()

"""
INSERT INTO public.users (name, username, email, created_at, password, hasEmailVerify)
VALUES 
('Nguyen Van A 6', 'nguyenvana6', 'nguyenvana6@gmail.com', '2023-07-29 08:57:10.057436', '$2b$10$xgUsVbRkgkqiHGrcQIhL0.7OwluRxKu.m2IHvWJon9F8OhK5m76My', true),
('Nguyen Van A 6', 'nguyenvana6', 'nguyenvana6@gmail.com', '2023-07-29 08:57:10.057436', '$2b$10$xgUsVbRkgkqiHGrcQIhL0.7OwluRxKu.m2IHvWJon9F8OhK5m76My', true);
"""

# count new user group by created_at and format date to "yyyy-mm-dd"
"""
SELECT COUNT(id), to_char(created_at, 'yyyy-mm-dd') as date FROM public.users
WHERE created_at >= '2021-01-01 00:00:00' AND created_at <= '2021-12-31 23:59:59'
GROUP BY date
ORDER BY date ASC;

"""


# generate sql insert user
import random
import string
import datetime
import names


def getFullName():
    return names.get_full_name()


def getUsername(fullName):
    return fullName.lower().replace(" ", "") + str(random.randint(1000, 10000))


def getEmail(username):
    return username + "@gmail.com"


def getRandomTimestamptz():
    # made sure that the date is in the past
    return datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 200))


def getPassword():
    return "$2b$10$xgUsVbRkgkqiHGrcQIhL0.7OwluRxKu.m2IHvWJon9F8OhK5m76My"


# generate sql insert user
def generateSqlInsertUser():
    fullName = getFullName()
    username = getUsername(fullName)
    email = getEmail(username)
    createdAt = getRandomTimestamptz()
    password = getPassword()
    sql = f"('{fullName}', '{username}', '{email}', '{createdAt}', '{password}', true)"
    return sql


def generateSqlInsertUsers():
    sql = 'INSERT INTO public.users (name, username, email, created_at, password, "hasEmailVerify") VALUES '
    for i in range(10000):
        sql += generateSqlInsertUser()
        sql += ",\n"

    sql = sql[:-2]
    sql += ";"
    return sql


sql = generateSqlInsertUsers()

# save to file
f = open("generate-user.sql", "w")
f.write(sql)
f.close()

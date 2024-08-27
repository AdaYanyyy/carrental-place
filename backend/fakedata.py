import pandas as pd
import random
from faker import Faker
from sqlalchemy import create_engine

fake = Faker('en_AU')  # Australian English locale

# Generate ParkingSpace data
parking_spaces = []
for i in range(1, 5001):  # Assuming we want to generate 100 parking spaces
    location = f"{fake.street_address()}, NSW, Sydney, Zetland" if i % 10 == 0 else fake.address()
    owner = random.randint(1, 20)  # Random owner id between 1 and 20
    # is_occupied = fake.boolean()
    img_path = f"/images/parking/{i}.jpg"
    day_price = round(random.uniform(20, 50), 2)  # Random day price between 20 and 50
    hour_price = round(day_price / 24, 2)  # Hour price is a fraction of day price
    description = fake.text()
    start_time = fake.date_time_this_year()
    end_time = fake.date_time_between_dates(start_time, start_time + pd.DateOffset(days=14))
    rate = round(random.uniform(1, 5), 2)  # Random rate between 1 and 5
    car_type = random.choice(['Small', 'Medium', 'Large'])
    income = round(random.uniform(1000, 5000), 2)  # Random income between 1000 and 5000

    parking_spaces.append({
        'id': i,
        'owner_id': owner,
        'location': location,
        'img_path': img_path,
        'day_price': day_price,
        'hour_price': hour_price,
        'description': description,
        'start_time': start_time,
        'end_time': end_time,
        'rate': rate,
        'car_type': car_type,
        'income': income
    })

parking_data = pd.DataFrame(parking_spaces)

# Generate Order data
orders = []
for i in range(1, 5001):  # Assuming we want to generate 200 orders
    consumer = 9 if i % 5 == 0 else random.randint(1, 20)  # Every 5th order is for consumer id 9
    car_type = random.choice(['CAR', 'SUV', 'MPV'])
    car_code = fake.license_plate()
    parking_space = random.randint(1, 100)  # Assuming parking space id is between 1 and 100
    start_time = fake.date_time_this_year()
    end_time = fake.date_time_between_dates(start_time, start_time + pd.DateOffset(days=1))
    status = random.choice(['Booked', 'Cancelled', 'Completed'])

    orders.append({
        'id': i,
        'consumer_id': consumer,
        'car_type': car_type,
        'car_code': car_code,
        'parking_space_id': parking_space,
        'start_time': start_time.strftime('%Y-%m-%d %H:%M:%S'),
        'end_time': end_time.strftime('%Y-%m-%d %H:%M:%S'),
        'status': 'finished',
    })

order_data = pd.DataFrame(orders)

Account = []
for i in range(1, 21):
    # username = fake.user_name()
    username = f'user{i}'
    phone = fake.phone_number()
    # email = fake.email()
    email = f'user{i}@example.com'
    carType = random.choice(['CAR', 'SUV', 'MPV'])
    carCode = fake.license_plate()
    last_login = fake.date_time_this_year()
    # password = fake.password()
    password = '123'

    Account.append({
        'id': i,
        'username': username,
        'phone': phone,
        'email': email,
        'carType': carType,
        'carCode': carCode,
        'password': password,
        'last_login': last_login.strftime('%Y-%m-%d %H:%M:%S'),
        'is_staff': 0,
        'is_superuser': 0,
    })
account_data = pd.DataFrame(Account)

engine = create_engine('sqlite:///db.sqlite3')
# parking_data.to_sql('person_parkingspace', engine, if_exists='append', index=False)
# order_data.to_sql('person_order', engine, if_exists='append', index=False)
# account_data.to_sql('login_account', engine, if_exists='append', index=False)

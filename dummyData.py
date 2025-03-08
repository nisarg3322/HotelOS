# from faker import Faker
# from collections import defaultdict
# import random


# def generate_addresses(num_addresses=50, min_addresses_per_area=2):
#     fake = Faker()
#     area_to_addresses = defaultdict(list)
#     values = []
#     address_list = []
#     address_id = 1

#     while len(values) < num_addresses:
#         city = fake.city()
#         state = fake.state()

#         if city in area_to_addresses and len(area_to_addresses[city]) >= min_addresses_per_area:
#             continue

#         for _ in range(min_addresses_per_area):
#             if len(values) >= num_addresses:
#                 break

#             street_address = fake.street_address()
#             postal_code = fake.zipcode()
#             area_to_addresses[city].append(
#                 (street_address, state, postal_code, address_id))
#             address_list.append((address_id, city, state))
#             values.append(
#                 f"('{street_address}', '{city}', '{state}', '{postal_code}')")
#             address_id += 1

#     insert_query = "INSERT INTO Address (street_address, city, state, postal_code) VALUES\n" + \
#         ",\n".join(values) + ";"

#     return insert_query, address_list


# def generate_hotels(num_chains=5, hotels_per_chain=8, min_hotels_per_area=2):
#     fake = Faker()
#     hotels = []

#     address_query, address_list = generate_addresses()

#     random.shuffle(address_list)
#     used_addresses = set()

#     for chain_id in range(1, num_chains + 1):
#         chain_hotels = []
#         city_groups = defaultdict(list)

#         for address_id, city, state in address_list:
#             city_groups[(city, state)].append(address_id)

#         selected_cities = random.sample(list(city_groups.keys()), k=min(
#             len(city_groups), hotels_per_chain // min_hotels_per_area))

#         for city_state in selected_cities:
#             available_addresses = [
#                 addr for addr in city_groups[city_state] if addr not in used_addresses]
#             selected_addresses = random.sample(available_addresses, k=min(
#                 min_hotels_per_area, len(available_addresses)))

#             for address_id in selected_addresses:
#                 used_addresses.add(address_id)
#                 name = fake.company() + " Hotel"
#                 email = fake.email()
#                 phone_number = fake.numerify("(###) ###-####")
#                 category = random.randint(1, 5)

#                 chain_hotels.append(
#                     f"('{chain_id}', '{name}', '{address_id}', '{email}', '{phone_number}', '{category}')")

#         while len(chain_hotels) < hotels_per_chain:
#             address_id, city, state = random.choice(
#                 [addr for addr in address_list if addr[0] not in used_addresses])
#             used_addresses.add(address_id)
#             name = fake.company() + " Hotel"
#             email = fake.email()
#             phone_number = fake.numerify("(###) ###-####")
#             category = random.randint(1, 5)

#             chain_hotels.append(
#                 f"('{chain_id}', '{name}', '{address_id}', '{email}', '{phone_number}', '{category}')")

#         hotels.extend(chain_hotels[:hotels_per_chain])

#     insert_query = "INSERT INTO Hotel (chain_id, name, address_id, email, phone_number, category) VALUES\n" + \
#         ",\n".join(hotels) + ";"

#     return address_query, insert_query


# if __name__ == "__main__":
#     address_query, hotel_query = generate_hotels()
#     print(address_query)
#     print(hotel_query)

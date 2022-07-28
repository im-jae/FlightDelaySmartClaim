import requests

url = 'http://apis.data.go.kr/B551177/StatusOfPassengerFlightsOdp/getPassengerDeparturesOdp'
params = {'serviceKey': 'YSDOR3HS0DFRYNflJ9kvGx81f3N+E0mPGQU/5xM1wSIVxzMgt2GZ6VOn7u7DbT+MLYdnOvw45k4WlqaRYXTgpg==',
          'from_time': '0000', 'to_time': '2400', 'airport': '', 'flight_id': '',
          'airline': '', 'lang': 'K', 'type': 'json'}
response = requests.get(url, params=params)
print(response.content)

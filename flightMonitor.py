import pymysql
import requests

db = pymysql.connect(
    user='admin',
    passwd='alswo150',
    host='fdsc.clqfr6b1x4f8.ap-northeast-2.rds.amazonaws.com',
    port=3306,
    db='FDSC',
)

cursor = db.cursor(pymysql.cursors.DictCursor)

url = 'http://apis.data.go.kr/B551177/StatusOfPassengerFlightsOdp/getPassengerDeparturesOdp'
params = {'serviceKey': 'YSDOR3HS0DFRYNflJ9kvGx81f3N+E0mPGQU/5xM1wSIVxzMgt2GZ6VOn7u7DbT+MLYdnOvw45k4WlqaRYXTgpg==',
          'from_time': '0000', 'to_time': '2400', 'airport': '', 'flight_id': '',
          'airline': '', 'lang': 'K', 'type': 'json'}
response = requests.get(url, params=params)
json = response.json()
# print(json)
items = json.get("response").get("body").get("items")
arr = []
for i in items:
    typeOfFlight = i.get("typeOfFlight")
    airline = i.get("airline")
    flightId = i.get("flightId")
    scheduleDateTime = i.get("scheduleDateTime")
    estimatedDateTime = i.get("estimatedDateTime")
    airport = i.get("airport")
    chkinrange = i.get("chkinrange")
    gatenumber = i.get("gatenumber")
    remark = i.get("remark")
    codeshare = i.get("codeshare")
    masterflightid = i.get("masterflightid")
    airportCode = i.get("airportCode")
    cityCode = i.get("cityCode")
    terminalId = i.get("terminalId")
    elapsetime = i.get("elapsetime")
    firstopover = i.get("firstopover")
    firstopovername = i.get("firstopovername")
    secstopover = i.get("secstopover")
    secstopovername = i.get("secstopovername")
    thistopover = i.get("thistopover")
    thistopovername = i.get("thistopovername")
    foustopover = i.get("foustopover")
    foustopovername = i.get("foustopovername")
    fifstopover = i.get("fifstopover")
    fifstopovername = i.get("fifstopovername")
    sixstopover = i.get("sixstopover")
    sixstopovername = i.get("sixstopovername")
    sevstopover = i.get("sevstopover")
    sevstopovername = i.get("sevstopovername")
    eigstopover = i.get("eigstopover")
    eigstopovername = i.get("eigstopovername")
    ninstopover = i.get("ninstopover")
    ninstopovername = i.get("ninstopovername")
    tenstopover = i.get("tenstopover")
    tenstopovername = i.get("tenstopovername")
    sql = """
          INSERT INTO FDSC.TB_FLGHT_DLY (TYPEOFFLIGHT, AIRLINE, FLIGHTID, SCHEDULEDATETIME, ESTIMATEDDATETIME, AIRPORT, CHKINRANGE, GATENUMBER,
          REMARK, CODESHARE, MASTERFLIGHTID, AIRPORTCODE, CITYCODE, TERMINALID, ELAPSETIME, FIRSTOPOVER, 
          FIRSTOPOVERNAME, SECSTOPOVER, SECSTOPOVERNAME, THISTOPOVER, THISTOPOVERNAME, FOUSTOPOVER, FOUSTOPOVERNAME,
          FIFSTOPOVER, FIFSTOPOVERNAME, SIXSTOPOVER, SIXSTOPOVERNAME, SEVSTOPOVER, SEVSTOPOVERNAME, EIGSTOPOVER, EIGSTOPOVERNAME, NINSTOPOVER, NINSTOPOVERNAME, TENSTOPOVER, TENSTOPOVERNAME, INP_DATE) 
          VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW());
          """
    arr.append([typeOfFlight,airline,flightId,scheduleDateTime,estimatedDateTime,airport,chkinrange,gatenumber,remark,codeshare,masterflightid,airportCode,cityCode,terminalId,elapsetime,firstopover,firstopovername,secstopover,secstopovername,thistopover,thistopovername,foustopover,foustopovername,fifstopover,fifstopovername,sixstopover,sixstopovername,sevstopover,sevstopovername,eigstopover,eigstopovername,ninstopover,ninstopovername,tenstopover,tenstopovername])

# print(arr)
cursor.executemany(sql, arr)
db.commit()

import datetime

from flask import Flask, render_template, request, jsonify
import requests
from requests import Response

import dbConn
from contractController import contractController

app = Flask(__name__)


app.register_blueprint(contractController)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/flight_delay')
def flight_delay():
    return render_template('flight_delay.html')


@app.route('/dash_board')
def dash_board():
    return render_template('dash_board.html')


@app.route('/get_data')
def get_data():
    url = 'http://apis.data.go.kr/B551177/StatusOfPassengerFlightsOdp/getPassengerDeparturesOdp'
    params = {'serviceKey': 'YSDOR3HS0DFRYNflJ9kvGx81f3N+E0mPGQU/5xM1wSIVxzMgt2GZ6VOn7u7DbT+MLYdnOvw45k4WlqaRYXTgpg==',
              'from_time': '0000', 'to_time': '2400', 'airport': '', 'flight_id': '',
              'airline': '', 'lang': 'K', 'type': 'json'}
    response = requests.get(url, params=params)
    return response.content


@app.route('/callRefundApi', methods=['POST'])
def call_refund_api():
    name = request.form['name']
    phone_number = request.form['phone_number']
    api_url = 'https://payapi-web.dozn.co.kr/callRefundApi'
    api_key = 'c16bbe02-3b2c-435c-a134-caa0b7f646d9'
    cid = 'RF00000'
    partner_order_id = "H_" + "{:%Y%m%d%H%M%S%f}".format(datetime.datetime.now())
    amount = '1'
    description = '한화손해보험 항공지연보험 보험금지급(test)'
    url = '/refund/v1/accept/phone'
    params = {"api_key": api_key,
              "cid": cid,
              "partner_order_id": partner_order_id,
              "amount": amount,
              "description": description,
              "phone_number": phone_number,
              "user_name": name,
              "url": url
              }
    print(params)
    response = requests.post(api_url, json=params)
    print(response.content)
    return response.content


@app.route('/get_AviationStatsByTimeline')
def get_AviationStatsByTimeline():
    url = 'http://apis.data.go.kr/B551177/AviationStatsByTimeline/getTotalTonsOfCargo'
    params ={
             'serviceKey' : 'YSDOR3HS0DFRYNflJ9kvGx81f3N+E0mPGQU/5xM1wSIVxzMgt2GZ6VOn7u7DbT+MLYdnOvw45k4WlqaRYXTgpg==',
             'from_month' : '202206',
             'to_month' : '202207',
             'periodicity' : '0',
             'pax_cargo' : 'Y',
             'domestic_foreign' : 'I',
             'baggage_type' : '1',
             'type' : 'json'
             }

    response = requests.get(url, params=params)
    return response.content


@app.route('/get_AviationStatsByAirline')
def get_AviationStatsByAirline():
    url = 'http://apis.data.go.kr/B551177/AviationStatsByAirline/getTotalTonsOfCargo'
    params ={
             'serviceKey' : 'YSDOR3HS0DFRYNflJ9kvGx81f3N+E0mPGQU/5xM1wSIVxzMgt2GZ6VOn7u7DbT+MLYdnOvw45k4WlqaRYXTgpg==',
              'from_month' : '202206',
              'to_month' : '202207',
              'periodicity' : '0',
              'pax_cargo' : 'Y',
              'domestic_foreign' : 'I',
              'type' : 'json'
             }

    response = requests.get(url, params=params)
    return response.content


@app.route('/test', methods=['GET'])
def test_get():
    response = request.args.get('title_give')
    print(response)
    return jsonify({'result': 'success', 'msg': '이 요청은 GET!'})


@app.route('/test', methods=['POST'])
def test_post():
    title_receive = request.form['title_give']
    print(title_receive)
    return jsonify({'result': 'success', 'msg': '이 요청은 POST!'})


@app.route('/test_db')
def test_db():
    sql = 'SELECT * FROM TB_FLGHT_DLY'
    result = dbConn.dbConn(sql)
    print(result)
    return render_template('index.html')


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)

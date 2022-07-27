from flask import render_template, request, Blueprint

import dbConn

contractController = Blueprint('contract', __name__, template_folder="templates")


@contractController.route('/contract')
def contract():
    return render_template('contract.html')


# @contract.route('/searchContract', methods=['POST'])
@contractController.route('/search_contract', methods=['POST'])
def search_contract():
    # flight_id = request.form['flight_id']
    flight_id = "lj201"
    sql = "SELECT CR.PLYNO, CR.FLIGHT_ID, CTM.CTMNM, "
    sql += "CONCAT(CTM.HP_ARENO,CTM.HP_TNO,CTM.HP_SNO) AS TEL, CR.ISR_DT, CR.TWAY, CR.FLIGHT_TICKET, CR.LATITUDE, " \
           "CR.LONGITUDE "
    sql += " FROM TB_CONTRACT CR"
    sql += " , TB_CTM CTM"
    sql += " WHERE CR.NRD_CTM = CTM.CTMNO"
    # sql += "   AND CR.PLYNO = " + flight_id +" "
    result = dbConn.dbConn(sql)
    return result
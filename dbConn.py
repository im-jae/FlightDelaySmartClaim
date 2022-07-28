import MySQLdb
import pandas as pd

connection = MySQLdb.connect(
    user='admin',
    passwd='alswo150',
    host='fdsc.clqfr6b1x4f8.ap-northeast-2.rds.amazonaws.com',
    port=3306,
    db='FDSC',
)


def dbSelect(sql):
    df = pd.read_sql(sql, con=connection)
    result = df.to_json(orient='records')
    print(result)
    connection.close()
    return result
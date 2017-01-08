#coding: utf-8
import requests, json, sys, time, re, threading
reload(sys)
sys.setdefaultencoding("utf-8")



#初始化session
def sessionInit():
    session = requests.Session()
    session.headers['User-Agent'] = r'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36'
    session.cookies['InitUser'] = '%7B%22value%22%3A%7B%22NickName%22%3A%22%E6%88%91%E6%98%AF%E7%8E%8B%E5%A4%A7%E9%94%A4%22%2C%22NotReadLetterCount%22%3A1112%2C%22Amount%22%3A%2293%2C659%2C023.14%22%2C%22IsAdmin%22%3Atrue%2C%22AdminUrl%22%3A%22%2FAdmin%22%2C%22NowTime%22%3A1408%2C%22Sex%22%3A1%2C%22IsVip%22%3Atrue%7D%2C%22expires%22%3A1447136618369%7D'
    return session

def login(session, base_url, phone, pwd):
    data = {
    'Phone': phone,
    'Password': pwd,
    'RandCode':''
    }
    session.post(base_url+'login/', data=data)

def invest(session, base_url, prjId, amount):
    re_token = re.compile(r'<input name="__RequestVerificationToken" type="hidden" value="(.*)" />')
    invest_page = session.get(base_url+'Project/InvestConfirm?PackageId='+ str(prjId)).text
    token = re_token.findall(invest_page)[0]
    investData = {
    'projectId': prjId,
    'amount': amount,
    'couponId': 0,
    'accountType': 1,
    '__RequestVerificationToken' : token
    }
    flag = 0
    while flag != 1: 
        result = json.loads(session.post(base_url+'investment/invest', data=investData).text)
        print result["State"]
        print result["Message"]
        time.sleep(0.2)

def countTime(base_url, phone, pwd):
    session = sessionInit()
    #获取今日ID
    prjResult = json.loads(session.get(base_url+'home/ActivityPrj').text)
    prjId = prjResult["HotPrj"]["Data"][0]["prjId"]
    print prjId

    #获取当前账户余额    
    login(session, base_url, phone, pwd)
    r = json.loads(session.post(base_url+'Home/InitUser').text)
    amount = r["Amount"].split('.')[0].replace(',', '')    
    a = int(amount) 
    if a > 100:
        if a > 20000:
            amount = '20000'
        print amount
        tag = 0
        while tag != 1:
            systemtime = session.get(base_url+'home/PrjNumAndDailyBao').headers["Date"][17:25]
            print systemtime
            if systemtime == '04:00:00' or systemtime == '04:00:01':
                tag = 1
                invest(session, base_url, prjId, amount)
        

def run():
    base_url = 'http://www.ppmoney.com/'
    for i in range(1):
        print i
        threading.Thread(target=countTime, args=(base_url, '13763075679', '19610920', )).start()
run()



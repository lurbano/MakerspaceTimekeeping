import time
from tinydb import TinyDB, Query

class studentLogger:

    def __init__(self, handler, db_dir):
        self.db_dir = db_dir
        self.timeDB = TinyDB(db_dir+'timeLog.json')
        self.handler = handler

    def logSignIn(self, info):
        print('hi', info)
        try:
            self.timeDB.insert(info)
            self.handler.write_message({'info':'sign in', 'msg':info['action']+" successful."})
        except:
            self.handler.write_message({'info':'sign in', 'msg':"Error: Failed to sign in."})


class checkoutLogger:

    def __init__(self, handler, db_dir):
        self.db_dir = db_dir
        # self.logDB = TinyDB(db_dir+'checkoutLog.json')
        self.handler = handler

    def checkout(self, info):
        print('hi', info)

        self.logDB = TinyDB(f'{self.db_dir}{info["itemType"]}.json')

        try:
            self.logDB.insert(info)
            self.handler.write_message({'info':'checkout', 'msg':f'{info["action"]} of {info["itemType"]} ({info["item"]}) by {info["name"]} successful'})

        except:
            self.handler.write_message({'info':'checkout', 'msg':"Error: Failed to Check In/Out"})

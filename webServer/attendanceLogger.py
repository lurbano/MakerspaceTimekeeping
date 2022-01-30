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
